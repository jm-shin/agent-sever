const mysql = require('mysql');

const config = {  //change config
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

const pool = mysql.createPool(config);
const logger = require('../util/logger');
const tableName = 'kakao_conf';
const desc = '[kakao_conf]';

const insertToken = (info) => {
    const fn = 'insertToken';
    return new Promise(function(resolve, reject) {
        pool.getConnection(function(err, conn) {
            if (err) {
                if (conn) {
                    conn.release();
                }
                reject(Error(`${fn} DB connection error`));
            }

            const sql = 'INSERT INTO ?? SET ?';

            const data = {
                user_name: 'biz',
                token: info.accesstoken,
                type: info.type,
                expired: info.expired
            };

            const exec = conn.query(sql, [tableName, data], function(err, rows) {
                logger.info(`${desc} ${fn} execution target sql [${exec.sql}]`);
                conn.release();
                if (err) {
                    reject(err);
                }
                resolve(rows);
            });
        });
    });
}

const updateToken = (info) => {
    const fn = 'updateToken';

    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            if (err) {
                if (conn) conn.release();
                reject(Error(`${desc} ${fn} DB connection error!`));
            } else {
                logger.info(`${desc} ${fn} db connection thread id: ${conn.threadId}`);
            }

            const data = {
                token: info.accesstoken,
                type: info.type,
                expired: info.expired
            };

            const columns = ['user_name'];
            const id = 'biz';
            const sql = 'UPDATE ?? ' +
                'SET ? ' +
                'WHERE ?? = ?';

            const exec = conn.query(sql, [tableName, data, columns[0], id], function(err, rows) {
                logger.info(`${desc} ${fn} execution target sql [${exec.sql}]`);
                conn.release();
                if (err) {
                    reject(err);
                }
                resolve(rows);
            });
        });
    });
}

const deleteToken = () => {
    const fn = 'deleteToken';

    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            if (err) {
                if (conn) conn.release();
                reject(Error(`${desc} ${fn} DB connection error!`));
            } else {
                logger.info(`${desc} ${fn} db connection thread id: ${conn.threadId}`);
            }
            const columns = ['user_name'];
            const id = 'biz';
            const sql = 'DELETE FROM ?? WHERE ?? IN (?)';

            const exec = conn.query(sql, [tableName, columns[0], id], (err, rows) => {
                logger.info(`${desc} ${fn} execution target sql: [${exec.sql}]`);
                conn.release();

                if (err) {
                    reject(err);
                }
                resolve(rows);
            });
        });
    });
}

const selectToken = () => {
    const fn = 'selectToken';
    return new Promise(function(resolve, reject) {
        pool.getConnection(function(err, conn) {
            if (err) {
                if (conn) {
                    conn.release();
                }
                reject(Error(`${fn} DB connection error`));
            }

            const sql = 'SELECT token FROM ??';

            const exec = conn.query(sql, tableName, function(err, rows) {
                logger.info(`${desc} ${fn} execution target sql: [${exec.sql}]`);
                conn.release();
                if (err) {
                    reject(err);
                }
                if (rows.length > 0) {
                    logger.info(`${JSON.stringify(rows[0].token)}`);
                    resolve(rows[0].token);
                } else {
                    resolve('Not Exist');
                }
            });
        });
    });
}

module.exports.insertToken = insertToken;
module.exports.updateToken = updateToken;
module.exports.deleteToken = deleteToken;
module.exports.selectToken = selectToken;