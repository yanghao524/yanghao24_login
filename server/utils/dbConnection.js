/**
 * 数据库连接管理工具
 * 负责管理SQLite数据库连接和提供基本的数据库操作方法
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// 数据库文件路径
const dbPath = path.join(__dirname, '../../', process.env.DB_PATH || 'users.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        throw err;
    }
    console.log('Connected to the SQLite database.');
});

/**
 * 执行SQL查询（返回多条结果）
 * @param {string} sql SQL查询语句
 * @param {Array} params 查询参数
 * @returns {Promise<Array>} 查询结果数组
 */
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * 执行SQL查询（返回单条结果）
 * @param {string} sql SQL查询语句
 * @param {Array} params 查询参数
 * @returns {Promise<Object|null>} 查询结果对象或null
 */
const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

/**
 * 执行SQL语句（插入、更新、删除等）
 * @param {string} sql SQL语句
 * @param {Array} params 查询参数
 * @returns {Promise<Object>} 包含lastID和changes的对象
 */
const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    lastID: this.lastID,
                    changes: this.changes
                });
            }
        });
    });
};

/**
 * 关闭数据库连接
 * @returns {Promise<void>} 关闭成功的Promise
 */
const close = () => {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// 导出数据库操作方法
module.exports = {
    query,
    get,
    run,
    close
};
