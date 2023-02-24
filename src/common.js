const { ethers } = require('ethers');
const { FormatTypes, Interface } = ethers.utils;
const logger = require('./util/logger');
const consts = require('./consts');
const { crawl } = require('./util/crawler');
const dbUtil = require('./util/dbUtil');
const path = require('path');
const { existFile, readFile, writeFile } = require('./util/fs');
const cheerio = require('cheerio');


function fetchAddressesFromRawTrace(rawTrace, chainId) {

    let addresses = new Set();
    rawTrace = JSON.parse(rawTrace);

    if (chainId == '56') {
        //bnb
        let _ = rawTrace[0]
        if (_) {
            let calls = _.calls || [];
            for (let item of calls) {
                let { from, to } = item;
                if (from) addresses.add(from);
                if (to) addresses.add(to);
            }
        }
    } else {
        //other
        for (let item of rawTrace) {
            let action = item.action;
            if (!action) continue;
            let { from, to } = action;
            if (from) addresses.add(from);
            if (to) addresses.add(to);
        }
    }

    return Array.from(addresses);
}

function fetchFuncSelectorsFromRawTrace(rawTrace, chainId) {
    let funcSelectors = new Set();
    rawTrace = JSON.parse(rawTrace);

    if (chainId == '56') {
        //bnb
        let _ = rawTrace[0]
        if (_) {
            let calls = _.calls || [];
            for (let item of calls) {
                let { input } = item;
                if (input == '0x') continue;
                if (!input) {
                    console.log(input);
                } else {
                    funcSelectors.add(input.slice(0, 10));
                }
            }
        }

    } else {
        // other
        for (let item of rawTrace) {
            let action = item.action;
            if (!action) continue;
            let { input } = action;
            if (input == '0x') continue;
            if (!input) {
                console.log(input);
            } else {
                funcSelectors.add(input.slice(0, 10));
            }
        }
    }
    return Array.from(funcSelectors);
}

async function getAddrsToLabel(contracts, addrs, chainId) {
    logger.debug('====getAddrsToLabel====');
    // 从数据库中获取地址对应的label
    // 数据库中没有，则取爬取label数据
    let addrsModel = await dbUtil.get('address', { 'address': addrs, 'chain_id': chainId });

    let dbAddrs = addrsModel.map(ele => ele.address);
    let databased = {};

    for (let item of addrsModel) {
        let { address, label } = item;
        databased[address] = label;
    }

    let unLabeledAddrs = addrs.filter(ele => !dbAddrs.includes(ele));

    let fetched = await fetchAddrsLabelFromEtherscan(contracts, unLabeledAddrs, chainId);

    let combinded = Object.assign(databased, fetched);


    let insertData = [];
    for (let addr in fetched) {
        let label = fetched[addr];
        insertData.push({
            'address': addr,
            'label': label,
            'chain_id': chainId,
        });
    }
    if (insertData.length > 0) {
        await dbUtil.batchInsert('address', insertData);
    }

    return combinded;
}

async function fetchAddrsLabelFromEtherscan(contracts, addrs, chainId) {
    let addrToLabel = {};
    for (let addr of addrs) {
        let bool = contracts.includes(addr);
        let label = await _fetchAddrLabelFromEtherscan(addr, bool, chainId);
        if (label) addrToLabel[addr] = label;
    }
    return addrToLabel;
}

async function _crawl(uri, cache = true) {
    let content;

    let base64URI = new Buffer.from(uri).toString('base64');
    const filePath = path.join(path.resolve(__dirname, '..'), `./cache/pages/${base64URI}`);

    if (cache) {
        // 从文件中读取
        let exist = await existFile(filePath);
        if (exist) {
            content = await readFile(filePath);
            return content;
        }
    }

    // 爬取
    try {
        res = await crawl(uri);
        content = res.body;
        // 保存到文件中
        await writeFile(filePath, content);
    } catch (err) {
        logger.warn('_crawl failed', uri, err);
    }

    return content;
}

async function _fetchAddrLabelFromEtherscan(address, isContract, chainId) {
    let result = null;
    let uri = consts.ETHERSCAN_URI[chainId] + `/address/${address}`

    try {
        let content = await _crawl(uri);
        const $ = cheerio.load(content);

        let target = $('span[title="Public Name Tag (viewable by anyone)"]');
        result = target.text().trim();

        if (!result && isContract) {
            let elements = $('#ContentPlaceHolder1_tr_tokeninfo').find('a');
            if (elements.length > 0) {
                target = $(elements[0]);
                result = target.text().trim();
            } else {
                let elements = $('#ContentPlaceHolder1_contractCodeDiv').find('div');
                if (elements) {
                    elements = elements.toArray();
                    for (let item of elements) {
                        let text = $(item).text().trim();
                        if (text == 'Contract Name:') {
                            let target = $(item).next();
                            result = target.text().trim();
                            break;
                        }
                    }
                }
            }
        }

        logger.debug('_fetchAddrLabelFromEtherscan succeed', address);
    } catch (err) {
        logger.warn('_fetchAddrLabelFromEtherscan failed', address, err);
    }

    return result;
}

async function genSelectorToSig(contracts, addrs, funcSelectors, chainId) {
    logger.debug('====genSelectorToSig====');
    // 从数据库中获取地址对应的funcSig
    // 数据库中没有，则取爬取sig数据

    let records = await dbUtil.get('abi_fragment', { 'contract': addrs, 'chain_id': Number(chainId) });

    let dbAddrs = records.map(ele => ele.contract);
    let databased = {};

    for (let item of records) {
        let { selector, sig_full } = item;
        databased[selector] = sig_full;
    }

    let toFetchAddrs = addrs.filter(ele => !dbAddrs.includes(ele));
    // toFetchAddrs = await filterContracts(toFetchAddrs, chainId);
    toFetchAddrs = toFetchAddrs.filter(ele => contracts.includes(ele));

    let addrToAbis = await fetchAbiFromEtherscan(toFetchAddrs, chainId);

    let fetched = await _handleAddrToAbi(addrToAbis, chainId);
    let combinded = Object.assign(databased, fetched);

    let selector2sig = {};
    for (let selector of funcSelectors) {
        let sig = combinded[selector];
        if (sig) selector2sig[selector] = sig;
    }

    return selector2sig;
}

async function fetchAbiFromEtherscan(addrs, chainId) {
    let addrToAbis = {};
    for (let addr of addrs) {
        let abi = await _fetchAbiFromEtherscan(addr, chainId);
        if (abi) {
            abi = JSON.parse(abi);
            addrToAbis[addr] = abi;
        }
    }
    return addrToAbis;
}

async function _fetchAbiFromEtherscan(address, chainId) {
    let result = null;
    let uri = consts.ETHERSCAN_URI[chainId] + `/address/${address}`

    try {
        let content = await _crawl(uri);
        const $ = cheerio.load(content);

        let target = $('#js-copytextarea2');
        result = target.text();
        result = result.trim();
        logger.debug('_fetchAbiFromEtherscan succeed', address);
    } catch (err) {
        logger.warn('_fetchAbiFromEtherscan failed', address, err);
    }

    return result;
}

async function _handleAddrToAbi(addrToAbis, chainId) {
    let selectorToFullSig = {};
    let insertData = [];
    for (let addr in addrToAbis) {
        let abi = addrToAbis[addr];
        let selector2sig = _getSigToSelectors(abi);
        for (let selector in selector2sig) {
            let [funcSig, funcFullSig, fragmentType] = selector2sig[selector];
            selectorToFullSig[selector] = funcFullSig;

            // event不用selector，而用topic
            let topic = '';
            if (fragmentType === 'event') {
                topic = selector;
                selector = '';
            }
            insertData.push({
                'selector': selector,
                'sig': funcSig,
                'sig_full': funcFullSig,
                'contract': addr,
                'chain_id': chainId,
                'type': consts.ABI_FRAGMENT_TYPE[fragmentType],
                'topic': topic,
            });
        }
    }

    await dbUtil.batchInsert('abi_fragment', insertData);
    return selectorToFullSig;
}

function _getSigToSelectors(abi) {
    let selector2sig = {};

    const iface = new Interface(abi);

    for (let fragments of iface.fragments) {
        let type = fragments.type;
        if (!['function', 'event'].includes(fragments.type)) continue;

        let selector = '';
        let funcFullSig = fragments.format(FormatTypes.full);
        let funcSig = fragments.format(FormatTypes.sighash);

        switch (fragments.type) {
            case 'function':
                selector = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(funcSig)).slice(0, 10);
                break;
            case 'event':
                let topic = ethers.utils.id(funcSig);
                selector = topic;
                break;
            default:
                break;
        }

        selector2sig[selector] = [funcSig, funcFullSig, type];
    }
    
    return selector2sig;
}

function getProvider(chainId) {
    let providerUrl = consts['PROVIDERS'][chainId];
    let provider = new ethers.providers.JsonRpcProvider(providerUrl);
    return provider;
}

async function isContract(address, chainId) {
    if (!chainId) chainId = '1';
    let provider = getProvider(chainId);
    if (!provider) return false;

    let code = '0x';
    try {
        code = await provider.getCode(address);
    } catch (err) {
        logger.warn('====provider.getCode failed====', { address }, err);
    }

    return code !== '0x';
}

async function filterContracts(addrs, chainId) {
    if (!addrs || addrs.length == 0) return addrs;

    let contracts = [];
    for (let addr of addrs) {
        let bool = await isContract(addr, chainId);
        if (bool) contracts.push(addr);
    }

    return contracts;
}

async function checkIfContracts(addrs, chainId) {
    if (!addrs || addrs.length == 0) return;

    let promises = [];
    for (let addr of addrs) {
        let promise = isContract(addr, chainId);
        promises.push(promise);
    }

    let contracts = [];
    try {
        let values = await Promise.all(promises);
        for (let i = 0; i < values.length; i++) {
            if (values[i]) contracts.push(addrs[i]);
        }
    } catch (err) {
        logger.warn('cacheIfContracts failed', addrs, chainId);
    }

    return contracts;
}

async function filterLabeledAddrs(addrs) {
    if (!addrs || addrs.length == 0) return [];

    let records = await dbUtil.get('address', { 'address': addrs });

    return records;
}

function getAddrAndFuncSelectorsFromRawTrace(rawTrace, chainId) {
    let addrs = fetchAddressesFromRawTrace(rawTrace, chainId);
    let funcSelectors = fetchFuncSelectorsFromRawTrace(rawTrace, chainId);
    return [addrs, funcSelectors];
}

async function getLabelAndFuncSig(rawTrace, chainId) {
    let [addrs, funcSelectors] = getAddrAndFuncSelectorsFromRawTrace(rawTrace, chainId);

    let contracts = await checkIfContracts(addrs, chainId);

    let promises = [
        getAddrsToLabel(contracts, addrs, chainId),
        genSelectorToSig(contracts, addrs, funcSelectors, chainId)
    ];

    let [addrsToLabel, selector2sig] = await Promise.all(promises);

    return {
        addrsToLabel,
        selector2sig,
    };
}

async function getRawTrace(hash, chainId) {
    let rawTrace;

    const filePath = path.join(path.resolve(__dirname, '..'), `./cache/rawtrace/${hash}`);
    let exist = await existFile(filePath);

    if (exist) {
        // 从缓存文件中读取
        rawTrace = await readFile(filePath);
    } else {
        // 爬取
        rawTrace = await _fetchRawTrace(hash, chainId);
        // 保存到文件中
        if (rawTrace) await writeFile(filePath, rawTrace);
    }
    return rawTrace;
}

async function _fetchRawTrace(hash, chainId) {
    let rawTrace = '';

    let url = _getRawTraceUrl(hash, chainId);
    if (!url) return rawTrace;

    try {
        let content = await _crawl(url);
        if (content) {
            const $ = cheerio.load(content);
            let target = $('#editor').text();
            target = target.trim();
            if (target === 'The requested transaction hash does not exist. Unable to complete trace.') {

            } else {
                rawTrace = `[${target}]`;
                rawTrace = JSON.parse(rawTrace);
                rawTrace = JSON.stringify(rawTrace);
            }
        }
    } catch (err) {
        logger.error('_fetchRawTrace failed', err);
    }
    return rawTrace;
}

function _getRawTraceUrl(hash, chainId) {
    let url = '';
    let prefix = consts.ETHERSCAN_URI[chainId];
    switch (chainId) {
        // todo other chain
        case '1':
            url = `${prefix}/vmtrace?txhash=${hash}&type=parity#raw`;
            break;
        case '56':
            url = `${prefix}/vmtrace?txhash=${hash}&type=gethtrace2`;
            break;
        default:
            break;
    }
    return url;
}

module.exports = {
    getProvider,
    fetchAddrsLabelFromEtherscan,
    fetchAbiFromEtherscan,
    filterLabeledAddrs,
    getAddrsToLabel,
    genSelectorToSig,
    fetchAddressesFromRawTrace,
    getAddrAndFuncSelectorsFromRawTrace,
    getLabelAndFuncSig,
    getRawTrace,
};