const db = require('./postgresql');
const logger = require('./logger');


async function get(table, where, options = {}) {
    let records = [];
    try {
        records = await db.get(table, where, options);
    } catch (err) {
        logger.error('dbUtil get failed', { table, where, options }, err);
    }
    return records;
}

async function query(sql) {
    let result;
    try {
        result = await db.query(sql);
    } catch (err) {
        logger.error('dbUtil query failed', { sql }, err);
    }
    return result;
}

async function update(table, where, data) {
    let num = 0;
    try {
        num = await db.update(table, where, data);
    } catch (err) {
        logger.error('dbUtil update failed', { table, where, data }, err);
    }
    return num;
}

async function insert(table, data) {
    let num = 0;
    try {
        num = await db.insert(table, data);
    } catch (err) {
        logger.error('dbUtil insert failed', { table, data }, err);
    }
    return num;
}

async function batchInsert(table, datas) {
    let num = 0;
    if (datas && datas.length == 0) return num;

    try {
        num = await db.batchInsert(table, datas);
    } catch (err) {
        logger.error('dbUtil batchInsert failed', { table, datas }, err);
    }
    return num;
}

async function del(table, where) {
    let num = 0;
    try {
        num = await db.del(table, where);
    } catch (err) {
        logger.error('dbUtil del failed', { table, where }, err);
    }
    return num;
}

async function delAll(table) {
    let num = 0;
    try {
        num = await db.delAll(table);
    } catch (err) {
        logger.error('dbUtil delAll failed', { table }, err);
    }
    return num;
}


module.exports = {
    get,
    query,
    update,
    insert,
    batchInsert,
    del,
    delAll,
};