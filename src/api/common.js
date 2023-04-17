function fail(ctx, msg) {
    return ctx.response.body = { 'status': -1, 'message': msg };
}

function succeed(ctx, extraData = {}, msg = 'OK') {
    return ctx.response.body = { 'status': 0, 'message': msg, 'data': extraData };
}


module.exports = {
    fail,
    succeed,
}