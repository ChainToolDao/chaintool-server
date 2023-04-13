const traceview = require('./api/traceview');
const abiFragment = require('./api/abiFragment');
const abi = require('./api/abi');


const API_ROUTER = [
    ['post', '/traceview/analyze', traceview.analyze],
    ['get', '/func/selector/:name', abiFragment.getSelector],
    ['post', '/func/selector', abiFragment.submitSelector],
    ['get', '/event/topic/:name', abiFragment.getTopic],
    ['post', '/event/topic', abiFragment.submitTopic],
    ['get', '/abi/get', abi.get],
    ['post', '/abi/submit', abi.submit],
];


module.exports = {
    all: [...API_ROUTER],
};