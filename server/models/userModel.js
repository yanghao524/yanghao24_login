/**
 * 用户模型
 * 封装用户相关的数据库操作
 */

const { query, get, run } = require('../utils/dbConnection');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

/**
 * 用户模型类
 */
class UserModel {
    /**
     * 创建新用户
     * @param {Object} userData 用户数据
     * @param {string} userData.username 用户名
     * @param {string} userData.password 密码
     * @param {string} userData.email 电子邮箱
     * @param {string} [userData.phone] 手机号码
     * @param {string} userData.securityQuestion 安全验证问题
     * @param {string} userData.securityAnswer 安全验证答案
     * @param {string} userData.nickname 昵称
     * @returns {Promise<Object>} 创建结果
     */
    static async createUser(userData) {
        try {
            // 密码加密
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
            
            // 验证答案加密
            const hashedSecurityAnswer = await bcrypt.hash(userData.securityAnswer, saltRounds);

            // 插入用户数据
            const sql = `
                INSERT INTO users (username, password, email, phone, security_question, security_answer)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const result = await run(sql, [
                userData.username,
                hashedPassword,
                userData.email,
                userData.phone || null,
                userData.securityQuestion,
                hashedSecurityAnswer
            ]);

            // 创建用户扩展信息
            await this.createUserProfile(result.lastID);

            // 更新用户昵称
            if (userData.nickname) {
                await this.updateUserNickname(result.lastID, userData.nickname);
            }

            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * 创建用户扩展信息
     * @param {number} userId 用户ID
     * @returns {Promise<Object>} 创建结果
     */
    static async createUserProfile(userId) {
        try {
            const sql = `
                INSERT INTO user_profiles (user_id)
                VALUES (?)
            `;
            return await run(sql, [userId]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * 更新用户昵称
     * @param {number} userId 用户ID
     * @param {string} nickname 昵称
     * @returns {Promise<Object>} 更新结果
     */
    static async updateUserNickname(userId, nickname) {
        try {
            const sql = `
                UPDATE user_profiles
                SET nickname = ?
                WHERE user_id = ?
            `;
            return await run(sql, [nickname, userId]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * 根据用户名查找用户
     * @param {string} username 用户名
     * @returns {Promise<Object|null>} 用户信息
     */
    static async findUserByUsername(username) {
        try {
            const sql = `SELECT * FROM users WHERE username = ?`;
            return await get(sql, [username]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * 根据邮箱查找用户
     * @param {string} email 电子邮箱
     * @returns {Promise<Object|null>} 用户信息
     */
    static async findUserByEmail(email) {
        try {
            const sql = `SELECT * FROM users WHERE email = ?`;
            return await get(sql, [email]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * 根据ID查找用户
     * @param {number} id 用户ID
     * @returns {Promise<Object|null>} 用户信息
     */
    static async findUserById(id) {
        try {
            const sql = `SELECT * FROM users WHERE id = ?`;
            return await get(sql, [id]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * 根据手机号查找用户
     * @param {string} phone 手机号码
     * @returns {Promise<Object|null>} 用户信息
     */
    static async findUserByPhone(phone) {
        try {
            const sql = `SELECT * FROM users WHERE phone = ?`;
            return await get(sql, [phone]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * 根据昵称查找用户
     * @param {string} nickname 昵称
     * @returns {Promise<Object|null>} 用户信息
     */
    static async findUserByNickname(nickname) {
        try {
            const sql = `SELECT * FROM user_profiles WHERE nickname = ?`;
            return await get(sql, [nickname]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * 验证用户密码
     * @param {string} password 输入的密码
     * @param {string} hashedPassword 存储的加密密码
     * @returns {Promise<boolean>} 验证结果
     */
    static async verifyPassword(password, hashedPassword) {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            throw error;
        }
    }

    /**
     * 更新用户最后登录时间
     * @param {number} userId 用户ID
     * @returns {Promise<Object>} 更新结果
     */
    static async updateLastLogin(userId) {
        try {
            const sql = `
                UPDATE users
                SET last_login = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            return await run(sql, [userId]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * 获取用户完整信息（包含扩展信息）
     * @param {number} userId 用户ID
     * @returns {Promise<Object|null>} 完整用户信息
     */
    static async getUserFullInfo(userId) {
        try {
            const sql = `
                SELECT u.*, up.*
                FROM users u
                LEFT JOIN user_profiles up ON u.id = up.user_id
                WHERE u.id = ?
            `;
            return await get(sql, [userId]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * 更新用户扩展信息
     * @param {number} userId 用户ID
     * @param {Object} profileData 扩展信息数据
     * @returns {Promise<Object>} 更新结果
     */
    static async updateUserProfile(userId, profileData) {
        try {
            const sql = `
                UPDATE user_profiles
                SET nickname = ?, avatar = ?, gender = ?, birthday = ?, address = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            `;
            return await run(sql, [
                profileData.nickname || null,
                profileData.avatar || null,
                profileData.gender || null,
                profileData.birthday || null,
                profileData.address || null,
                userId
            ]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * 验证用户名是否存在
     * @param {string} username 用户名
     * @returns {Promise<boolean>} 验证结果
     */
    static async verifyUsername(username) {
        try {
            const user = await this.findUserByUsername(username);
            return !!user;
        } catch (error) {
            throw error;
        }
    }

    /**
     * 根据用户名获取安全问题
     * @param {string} username 用户名
     * @returns {Promise<string|null>} 安全问题
     */
    static async getSecurityQuestion(username) {
        try {
            const sql = `SELECT security_question FROM users WHERE username = ?`;
            const result = await get(sql, [username]);
            return result ? result.security_question : null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * 验证安全答案
     * @param {string} username 用户名
     * @param {string} answer 输入的答案
     * @returns {Promise<boolean>} 验证结果
     */
    static async verifySecurityAnswer(username, answer) {
        try {
            // 检查参数是否存在
            if (!username || !answer) {
                return false;
            }
            
            const sql = `SELECT security_answer FROM users WHERE username = ?`;
            const result = await get(sql, [username]);
            
            if (!result || !result.security_answer) {
                return false;
            }
            
            return await bcrypt.compare(answer, result.security_answer);
        } catch (error) {
            console.error('验证安全答案失败:', error.message);
            throw error;
        }
    }

    /**
     * 更新用户密码
     * @param {string} username 用户名
     * @param {string} newPassword 新密码
     * @returns {Promise<Object>} 更新结果
     */
    static async updatePassword(username, newPassword) {
        try {
            // 密码加密
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            
            const sql = `
                UPDATE users
                SET password = ?
                WHERE username = ?
            `;
            return await run(sql, [hashedPassword, username]);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = UserModel;
