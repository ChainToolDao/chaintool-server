const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const http = require("http");
const https = require('https');


dotenv.config({ 'path': path.join(path.resolve(__dirname, '..'), '.env') });
const PORT = process.env.PORT;
const logger = require('./util/logger');

const app = require('./koa');

process.on('uncaughtException', (err, origin) => {
    logger.error(process.stderr.fd, `Caught exception: ${err}\n` + `Exception origin: ${origin}`);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});


function run() {
    http.createServer(app.callback()).listen(PORT);
    logger.info(`httpServer listening ${PORT}`);

    if (process.env.SSL_ON === 'true') {
        // 启用SSL

        // 检查是否存在证书文件
        let keyFilePath = path.join(path.resolve(__dirname, '..'), 'cert', process.env.SSL_KEY);
        let certFilePath = path.join(path.resolve(__dirname, '..'), 'cert', process.env.SSL_CERT)
        if (!fs.existsSync(keyFilePath) || !fs.existsSync(certFilePath)) {
            logger.error('Please config ssl certificate');
            process.exit(1);
        }

        const options = {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        };

        https.createServer(options, app.callback()).listen(process.env.SSL_PORT);
        logger.info(`sslServer listening ${process.env.SSL_PORT}`);
    }
}


run();