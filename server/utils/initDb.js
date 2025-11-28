/**
 * 数据库初始化脚本
 * 用于创建数据库表结构
 */

const { createDatabaseConnection, createTables } = require('../config/db');

/**
 * 初始化数据库
 */
const initDatabase = () => {
    try {
        // 创建数据库连接
        const db = createDatabaseConnection();
        
        // 创建表结构
        createTables(db);
        
        // 关闭数据库连接
        db.close((err) => {
            if (err) {
                console.error('Error closing database connection:', err.message);
                process.exit(1);
            }
            console.log('Database initialization completed successfully.');
        });
    } catch (error) {
        console.error('Database initialization failed:', error.message);
        process.exit(1);
    }
};

// 执行数据库初始化
if (require.main === module) {
    initDatabase();
}

module.exports = { initDatabase };
