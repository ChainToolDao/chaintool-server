const logger = require('../util/logger');
const common = require('../common');


function _fail(ctx, msg) {
    return ctx.response.body = { 'status': -1, 'message': msg };
}

function _succeed(ctx, extraData = {}, msg = 'OK') {
    return ctx.response.body = { 'status': 0, 'message': msg, 'data': extraData };
}

async function analyze(ctx) {
    let { hash, chainId } = ctx.request.body;
    if (!hash) return _fail(ctx, 'Invalid hash');
    hash = hash.toLowerCase();

    if (!Number(chainId)) chainId = '1';

    let rawTrace = await common.getRawTrace(hash, chainId);
    if (!rawTrace) return _fail(ctx, 'Please check transaction hash or blockchain network');

    let { addrsToLabel, selector2sig } = await common.getLabelAndFuncSig(rawTrace, chainId);

    return _succeed(ctx, {
        resultRawTraces: rawTrace,
        resultAddressMap: JSON.stringify(addrsToLabel),
        resultFunctionMap: JSON.stringify(selector2sig),
    });
}


module.exports = {
    analyze,
};