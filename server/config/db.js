/**
 * 数据库配置文件
 * 负责初始化SQLite数据库连接和创建表结构
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// 数据库文件路径
const dbPath = path.join(__dirname, '../../', process.env.DB_PATH || 'users.db');

/**
 * 创建数据库连接
 * @returns {sqlite3.Database} SQLite数据库连接实例
 */
const createDatabaseConnection = () => {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            throw err;
        }
        console.log('Connected to the SQLite database.');
    });
    return db;
};

/**
 * 创建数据库表结构
 * @param {sqlite3.Database} db 数据库连接实例
 */
const createTables = (db) => {
    // 创建用户表
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone VARCHAR(20) UNIQUE,
            security_question VARCHAR(255) NOT NULL,
            security_answer VARCHAR(255) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            status TINYINT DEFAULT 1
        );
    `;

    // 创建用户扩展信息表
    const createUserProfilesTable = `
        CREATE TABLE IF NOT EXISTS user_profiles (
            user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            nickname VARCHAR(50),
            avatar VARCHAR(255),
            gender TINYINT,
            birthday DATE,
            address VARCHAR(255),
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

    // 执行创建表语句
    db.serialize(() => {
        db.run(createUsersTable, (err) => {
            if (err) {
                console.error('Error creating users table:', err.message);
                throw err;
            }
            console.log('Users table created successfully.');
        });

        db.run(createUserProfilesTable, (err) => {
            if (err) {
                console.error('Error creating user_profiles table:', err.message);
                throw err;
            }
            console.log('User_profiles table created successfully.');
        });
    });
};

// 导出数据库连接和表创建函数
module.exports = {
    createDatabaseConnection,
    createTables
};
