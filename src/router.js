const traceview = require('./api/traceview');
const abiFragment = require('./api/abiFragment');


const API_ROUTER = [
    ['post', '/traceview/analyze', traceview.analyze],
    ['get', '/func/selector/:name', abiFragment.getSelector],
    ['post', '/func/selector', abiFragment.submitSelector],
    ['get', '/event/topic/:name', abiFragment.getTopic],
    ['post', '/event/topic', abiFragment.submitTopic],
];


module.exports = {
    all: [...API_ROUTER],
};