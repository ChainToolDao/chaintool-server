const { Pool } = require('pg');
const logger = require('./logger');

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    max: 20,
    idleTimeoutMillis: 1000, // close idle clients after 1 second
    connectionTimeoutMillis: 5000,
});

async function query(sql) {
    let result;
    let client = await pool.connect();
    try {
        result = await client.query(sql);
    } catch (err) {
        logger.error('====db====query', { sql }, err);
    } finally {
        client.release();
    }
    return result;
}

async function get(table, whereClause = {}, options = {}) {
    let records = [];
    try {
        records = await knex(table).where((builder) => {
            for (let [key, value] of Object.entries(whereClause)) {
                if (Array.isArray(value)) {
                    builder.whereIn(key, value)
                } else {
                    builder.where(key, value)
                }
            }
        }).orderBy('id', 'desc');
    } catch (err) {
        logger.error('db get failed', { table, whereClause, options }, err);
    }
    return records;
}

async function update(table, where, upData) {
    let result = 0;
    let queryData = [];
    let paramIndex = 0;

    let sql = `update "${table}" set `;

    for (let key in upData) {
        if (key == 'id') continue;
        paramIndex++;
        let val = upData[key];
        queryData.push(val);
        sql += ` "${key}" = $${paramIndex}, `;
    }
    sql = sql.slice(0, -2); // 去掉最后面的', '

    let whereFields = Object.keys(where);
    if (whereFields.length > 0) {
        sql += ' where ';
        for (let field of whereFields) {
            paramIndex++;
            let val = where[field];
            if (Array.isArray(val)) {
                // 应付 in,>,< 之类的
                let [symbol, realVal] = val;

                if (symbol.toLowerCase() === 'in') {
                    let inStr = '';
                    for (let item of realVal) {
                        inStr += `$${paramIndex},`;
                        queryData.push(item);
                        paramIndex++;
                    }
                    inStr = inStr.slice(0, -1);
                    sql += ` "${field}" in (${inStr}) AND `;
                } else {
                    sql += ` "${field}" ${symbol} $${paramIndex} AND `;
                    queryData.push(realVal);
                }
            } else {
                sql += ` "${field}" = $${paramIndex} AND `;
                queryData.push(val);
            }
        }

        sql = sql.slice(0, -4); //去掉最后面的'and '
    }

    if (queryData.length == 0) {
        logger.warn('====db====update lack of parameters');
        return -1;
    }

    let client = await pool.connect();
    try {
        let r = await client.query(sql, queryData);
        if (r && r.rowCount) result = r.rowCount;
    } catch (err) {
        logger.error('====db====update', { table, where, upData, sql, queryData }, err);
        result = -1;
    } finally {
        client.release();
    }
    return result;
}

async function insert(table, data) {
    let id;
    try {
        let result = await knex(table).insert(data).returning('id');
        id = result[0].id;
    } catch (err) {
        logger.error('db insert failed', { table, data }, err);
    }
    return id;
}

async function batchInsert(table, datas) {
    let ids;
    try {
        let result = await knex(table).insert(datas).returning('id');
        ids = result.map(ele => ele.id);
    } catch (err) {
        logger.error('db insert failed', { table, datas }, err);
    }
    return ids;
}

async function del(table, where) {
    let result = 0;
    let queryData = [];
    let paramIndex = 0;

    let sql = `delete from "${table}"  `;

    let whereFields = Object.keys(where);
    if (whereFields.length > 0) {
        sql += ' where ';
        for (let field of whereFields) {
            paramIndex++;
            let val = where[field];
            sql += ` "${field}" = $${paramIndex} and `;
            queryData.push(val);
        }
        sql = sql.slice(0, -4); //去掉最后面的'and '
    }

    if (queryData.length == 0) {
        logger.warn('====db====del lack of parameters');
        return -1;
    }

    let client = await pool.connect();
    try {
        let r = await client.query(sql, queryData);
        if (r && r.rowCount) result = r.rowCount;
    } catch (err) {
        logger.error('====db====del', { table, where }, err);
        result = -1;
    } finally {
        client.release();
    }
    return result;
}

async function delAll(table, where) {
    let result = 0;
    let queryData = [];

    let sql = `delete from "${table}"`;

    let client = await pool.connect();
    try {
        let r = await client.query(sql, queryData);
        if (r && r.rowCount) result = r.rowCount;
    } catch (err) {
        logger.error('====db====delAll', { table, where }, err);
        result = -1;
    } finally {
        client.release();
    }
    return result;
}

const knex = require('knex')({
    client: 'pg',
    connection: {
        host: process.env.PGHOST,
        port: process.env.DB_PORT,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE
    },
    pool: { min: 0, max: 10 }
});


module.exports = {
    pool,
    query,
    get,
    update,
    insert,
    del,
    delAll,
    batchInsert,
};