const logger = require('../util/logger');
const dbUtil = require('../util/dbUtil');
const hashid = require('../util/hashid');
const { isValidAddress, isValidAbi, isValidChainId, getChecksumAddress } = require('../util/func');
const { fail: _fail, succeed: _succeed } = require('./common');


async function get(ctx) {
    logger.debug('getAbi', ctx.request.params);

    let { id } = ctx.request.query;
    id = hashid.decode(id);
    if (!id) return _succeed(ctx, null);

    let where = { id };
    let abiModel = await dbUtil.getOne('abi', where);

    const respData = {
        "id": hashid.encode(abiModel.id),
        "name": abiModel.name,
        "chainId": Number(abiModel.chain_id),
        "address": abiModel.address,
        "abi": abiModel.abi,
    }

    return _succeed(ctx, respData);
}

async function submit(ctx) {
    logger.debug('submitAbi', ctx.request.body);

    let { name, chainId, address, abi } = ctx.request.body;
    if (!chainId || !address || !abi) return _fail(ctx, 'Invalid params');
    if (!isValidAddress(address)) return _fail(ctx, 'Invalid address');
    if (!isValidAbi(abi)) return _fail(ctx, 'Invalid abi');
    if (!isValidChainId(chainId)) return _fail(ctx, 'Invalid chainId');

    address = getChecksumAddress(address);
    chainId = Number(chainId);
    // TODO: format abi

    const where = {
        "name": name,
        "chain_id": chainId,
        "address": address,
        "abi": abi,
    }
    const record = await dbUtil.getOne('abi', where)

    const respData = { id: null };
    if (record) {
        respData.id = hashid.encode(record.id);
    } else {
        const model = {
            "name": name,
            "chain_id": chainId,
            "address": address,
            "abi": abi,
        }

        const id = await dbUtil.insert('abi', model);
        respData.id = hashid.encode(id);
    }

    return _succeed(ctx, respData);
}


module.exports = {
    get,
    submit,
};