const logger = require('../util/logger');
const dbUtil = require('../util/dbUtil');
const hashid = require('../util/hashid');
const {isValidAddress, isValidAbi} = require('../util/func');
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
        "network": abiModel.chain_id,  // TODO: convert chain_id to network
        "address": abiModel.address,
        "abi": abiModel.abi,
    }

    return _succeed(ctx, respData);
}

async function submit(ctx) {
    logger.debug('submitAbi', ctx.request.body);

    let { name, network, address, abi } = ctx.request.body;
    if (!network || !address || !abi) return _fail(ctx, 'Invalid params');
    if(!isValidAddress(address)) return _fail(ctx, 'Invalid address');
    if(!isValidAbi(abi)) return _fail(ctx, 'Invalid abi');

    // TODO: check duplicate
    // TODO: convert network to chain_id

    const model = {
        "name": name,
        "chain_id": network,
        "address": address,
        "abi": abi,
    }

    let id = await dbUtil.insert('abi', model);
    id = hashid.encode(id);

    return _succeed(ctx, { id });
}


module.exports = {
    get,
    submit,
};