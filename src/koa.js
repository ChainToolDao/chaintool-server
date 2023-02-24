const Koa = require('koa');
const app = new Koa();
const KoaRouter = require('koa-router');
const router = new KoaRouter();
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const rules = require('./router');

app.use(cors());

const NotFound = ctx => {
    ctx.response.status = 404;
    ctx.response.body = 'Page Not Found';
};

const IntervalError = ctx => {
    ctx.throw(500);
};

const handler = async(ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.response.status = err.statusCode || err.status || 500;
        ctx.response.body = {
            message: err.message
        };
        ctx.app.emit('error', err, ctx);
    }
};
app.use(handler);

app.use(bodyParser());


router.get('/404', NotFound);
router.get('/500', IntervalError);

for (let rule of rules.all) {
    let [method, action, handler] = rule;
    method = method.toLowerCase();
    if (method === 'get') {
        router.get(action, handler);
    } else if (method === 'post') {
        router.post(action, handler);
    }
}

app.use(router.routes());

app.on('error', (err, ctx) => {
    console.error('server error', err);
});

module.exports = app;