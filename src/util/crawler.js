const Crawler = require('crawler');
const logger = require('./logger');

const crawler = new Crawler({
    maxConnections: 1,
    callback: (error, res, done) => {
        done();
    }
});

function crawl(uri) {
    return new Promise((resolve, reject) => {
        crawler.direct({
            uri,
            skipEventRequest: false,
            jQuery: 'cheerio',
            callback: (error, res) => {
                if (error) {
                    logger.warn('====crawl====', 'failed', uri);
                    reject(error);
                } else {
                    logger.debug('====crawl====', 'succeed', uri);
                    resolve(res);
                }
            }
        });
    });
}

module.exports = {
    crawl,
};