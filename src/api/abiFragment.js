const logger = require('../util/logger');
const { ethers } = require('ethers');
const dbUtil = require('../util/dbUtil');
const { ABI_FRAGMENT_TYPE } = require('../consts');


function _fail(ctx, msg) {
    return ctx.response.body = { 'status': -1, 'message': msg };
}

function _succeed(ctx, extraData = {}, msg = 'OK') {
    return ctx.response.body = { 'status': 0, 'message': msg, 'data': extraData };
}

async function getSelector(ctx) {
    logger.debug('getSelector', ctx.request.params);

    let { name } = ctx.request.params;
    if (!name) return _succeed(ctx, []);

    let records = await dbUtil.get('abi_fragment', { 'selector': name });
    let unrepeatSigs = Array.from(new Set(records.map(ele => ele.sig)));

    let sigs = [];
    for (let sig of unrepeatSigs) {
        let record = records.find(ele => ele.sig === sig);
        if (!record) continue;
        let targetSig = '';//优先返回完整版
        if (record.sig_full) {
            targetSig = record.sig_full.replace('function', '').trim();
        } else {
            targetSig = sig;
        }
        sigs.push(targetSig);
    }

    return _succeed(ctx, sigs);
}

async function submitSelector(ctx) {
    logger.debug('submitSelector', ctx.request.body);

    let { selector, signature } = ctx.request.body;
    if (!selector || !signature) return _fail(ctx, 'Invalid params');

    let fullSig = signature.startsWith('function') ? signature : `function ${signature}`;
    let shortSig = shortenSignature(fullSig);

    let selector_ = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(shortSig)).slice(0, 10);
    if (selector != selector_) return _fail(ctx, 'Unmatch function signature and seletor');

    // 避免重复
    const records = await dbUtil.get('abi_fragment', { 'selector': selector, 'sig': shortSig });
    if (records.length === 0) {
        const id = await dbUtil.insert('abi_fragment', { 'selector': selector, 'sig': shortSig, 'sig_full': fullSig, type: ABI_FRAGMENT_TYPE['function'] });
        if (!id) return _fail(ctx, 'Submit failed');
    }

    return _succeed(ctx);
}

async function getTopic(ctx) {
    logger.debug('getTopic', ctx.request.params);

    let { name } = ctx.request.params;
    if (!name) return _succeed(ctx, []);

    let records = await dbUtil.get('abi_fragment', { 'topic': name });
    let unrepeatSigs = Array.from(new Set(records.map(ele => ele.sig)));

    let sigs = [];
    for (let sig of unrepeatSigs) {
        let record = records.find(ele => ele.sig === sig);
        if (!record) continue;
        let targetSig = '';//优先返回完整版
        if (record.sig_full) {
            targetSig = record.sig_full.replace('event', '').trim();
        } else {
            targetSig = sig;
        }
        sigs.push(targetSig);
    }

    return _succeed(ctx, sigs);
}

async function submitTopic(ctx) {
    logger.debug('submitTopic', ctx.request.body);

    let { topic, signature } = ctx.request.body;
    if (!topic || !signature) return _fail(ctx, 'Invalid params');

    let fullSig = signature.startsWith('event') ? signature : `event ${signature}`;
    let shortSig = shortenSignature(fullSig);

    let topic_ = ethers.utils.id(shortSig);
    if (topic != topic_) return _fail(ctx, 'Unmatch function signature and topic');

    // 避免重复
    const records = await dbUtil.get('abi_fragment', { 'topic': topic, 'sig': shortSig });
    if (records.length === 0) {
        const id = await dbUtil.insert('abi_fragment', { 'topic': topic, 'sig': shortSig, 'sig_full': fullSig, type: ABI_FRAGMENT_TYPE['event'] });
        if (!id) return _fail(ctx, 'Submit failed');
    }

    return _succeed(ctx);
}

function shortenSignature(fullSignature) {
    let shortSig;

    try {
        const { FormatTypes, Interface } = ethers.utils;

        const iface = new Interface([fullSignature]);
        shortSig = iface.fragments[0].format(FormatTypes.sighash);

    } catch (err) {
        logger.warn('shortenSignature failed', fullSignature);
    }

    return shortSig;
}


module.exports = {
    getSelector,
    submitSelector,
    getTopic,
    submitTopic,
};