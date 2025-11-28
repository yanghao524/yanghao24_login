/**
 * 用户控制器
 * 处理用户注册、登录等业务逻辑
 */

const { body, validationResult } = require('express-validator');
const UserModel = require('../models/userModel');

/**
 * 用户注册验证规则
 */
exports.registerValidationRules = [
    body('username')
        .isLength({ min: 3, max: 50 })
        .withMessage('用户名长度必须在3-50个字符之间')
        .trim()
        .escape(),
    body('nickname')
        .isLength({ min: 1, max: 20 })
        .withMessage('昵称长度必须在1-20个字符之间')
        .trim()
        .escape(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('密码长度不能少于8个字符')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('密码必须包含至少一个大写字母、一个小写字母和一个数字')
        .trim(),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('两次输入的密码不一致');
            }
            return true;
        }),
    body('email')
        .isEmail()
        .withMessage('请输入有效的电子邮箱地址')
        .normalizeEmail(),
    body('phone')
        .optional()
        .isMobilePhone('zh-CN')
        .withMessage('请输入有效的手机号码')
        .trim()
        .escape(),
    body('securityQuestion')
        .notEmpty()
        .withMessage('请选择安全验证问题')
        .trim()
        .escape(),
    body('securityAnswer')
        .isLength({ min: 4, max: 20 })
        .withMessage('答案长度必须在4-20个字符之间')
        .trim()
        .escape()
];

/**
 * 用户登录验证规则
 */
exports.loginValidationRules = [
    body('username')
        .notEmpty()
        .withMessage('用户名不能为空')
        .trim()
        .escape(),
    body('password')
        .notEmpty()
        .withMessage('密码不能为空')
        .trim()
];

/**
 * 处理表单验证错误
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @param {Function} next 中间件函数
 * @returns {Object} 错误响应或继续执行
 */
exports.handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: '表单验证失败',
            errors: errors.array()
        });
    }
    next();
};

/**
 * 用户注册
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @returns {Object} 注册结果响应
 */
exports.register = async (req, res) => {
    try {
        // 检查用户名是否已存在
        const existingUserByUsername = await UserModel.findUserByUsername(req.body.username);
        if (existingUserByUsername) {
            return res.status(400).json({
                success: false,
                message: '用户名已被注册'
            });
        }

        // 检查邮箱是否已存在
        const existingUserByEmail = await UserModel.findUserByEmail(req.body.email);
        if (existingUserByEmail) {
            return res.status(400).json({
                success: false,
                message: '邮箱已被注册'
            });
        }

        // 检查手机号是否已存在（如果提供了手机号）
        if (req.body.phone) {
            const existingUserByPhone = await UserModel.findUserByPhone(req.body.phone);
            if (existingUserByPhone) {
                return res.status(400).json({
                    success: false,
                    message: '手机号已被注册'
                });
            }
        }

        // 检查昵称是否已存在
        const existingUserByNickname = await UserModel.findUserByNickname(req.body.nickname);
        if (existingUserByNickname) {
            return res.status(400).json({
                success: false,
                message: '该昵称已被使用，请更换其他昵称'
            });
        }

        // 创建新用户
        const userData = {
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            phone: req.body.phone,
            securityQuestion: req.body.securityQuestion,
            securityAnswer: req.body.securityAnswer,
            nickname: req.body.nickname
        };

        const result = await UserModel.createUser(userData);

        return res.status(201).json({
            success: true,
            message: '用户注册成功',
            userId: result.lastID
        });
    } catch (error) {
        console.error('注册失败:', error.message);
        return res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

/**
 * 用户登录
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @returns {Object} 登录结果响应
 */
exports.login = async (req, res) => {
    try {
        // 查找用户
        const user = await UserModel.findUserByUsername(req.body.username);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        // 验证密码
        const isPasswordValid = await UserModel.verifyPassword(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        // 检查用户状态
        if (user.status !== 1) {
            return res.status(403).json({
                success: false,
                message: '账号已被禁用'
            });
        }

        // 更新最后登录时间
        await UserModel.updateLastLogin(user.id);

        // 获取用户完整信息
        const userInfo = await UserModel.getUserFullInfo(user.id);

        // 移除敏感信息
        delete userInfo.password;

        return res.status(200).json({
            success: true,
            message: '登录成功',
            user: userInfo
        });
    } catch (error) {
        console.error('登录失败:', error.message);
        return res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

/**
 * 获取用户信息
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @returns {Object} 用户信息响应
 */
exports.getUserInfo = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: '无效的用户ID'
            });
        }

        const userInfo = await UserModel.getUserFullInfo(userId);
        if (!userInfo) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        // 移除敏感信息
        delete userInfo.password;

        return res.status(200).json({
            success: true,
            user: userInfo
        });
    } catch (error) {
        console.error('获取用户信息失败:', error.message);
        return res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

/**
 * 密码找回 - 验证用户名
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @returns {Object} 验证结果响应
 */
exports.verifyUsername = async (req, res) => {
    try {
        const { username } = req.body;
        
        // 验证用户名是否存在（返回模糊结果，不泄露具体信息）
        await UserModel.findUserByUsername(username);
        
        // 无论用户是否存在，都返回相同的成功响应，避免用户名枚举攻击
        return res.status(200).json({
            success: true,
            message: '验证成功'
        });
    } catch (error) {
        console.error('验证用户名失败:', error.message);
        return res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

/**
 * 密码找回 - 获取安全问题
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @returns {Object} 安全问题响应
 */
exports.getSecurityQuestion = async (req, res) => {
    try {
        const { username } = req.body;
        
        // 获取用户安全问题
        const securityQuestion = await UserModel.getSecurityQuestion(username);
        
        if (!securityQuestion) {
            // 若用户不存在或没有安全问题，返回默认问题（模糊处理）
            return res.status(200).json({
                success: true,
                securityQuestion: '您的出生地是哪里？'
            });
        }
        
        return res.status(200).json({
            success: true,
            securityQuestion
        });
    } catch (error) {
        console.error('获取安全问题失败:', error.message);
        // 即使发生错误，也返回默认安全问题，确保前端能继续流程
        return res.status(200).json({
            success: true,
            securityQuestion: '您的出生地是哪里？'
        });
    }
};

/**
 * 密码找回 - 验证安全答案
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @returns {Object} 验证结果响应
 */
exports.verifySecurityAnswer = async (req, res) => {
    try {
        const { username, securityAnswer } = req.body;
        
        // 验证安全答案
        const isValid = await UserModel.verifySecurityAnswer(username, securityAnswer);
        
        if (!isValid) {
            // 统一模糊错误提示，不泄露具体错误原因
            return res.status(400).json({
                success: false,
                message: '密码找回失败，可能原因：用户名错误、安全问题选择错误或答案不正确'
            });
        }
        
        return res.status(200).json({
            success: true,
            message: '验证成功'
        });
    } catch (error) {
        console.error('验证安全答案失败:', error.message);
        return res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

/**
 * 密码找回 - 重置密码
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @returns {Object} 重置结果响应
 */
exports.resetPassword = async (req, res) => {
    try {
        const { username, newPassword } = req.body;
        
        // 更新用户密码
        await UserModel.updatePassword(username, newPassword);
        
        return res.status(200).json({
            success: true,
            message: '密码重置成功'
        });
    } catch (error) {
        console.error('重置密码失败:', error.message);
        return res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

/**
 * 检查昵称唯一性
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @returns {Object} 检查结果响应
 */
exports.checkNickname = async (req, res) => {
    try {
        const { nickname } = req.body;
        
        if (!nickname) {
            return res.status(400).json({
                success: false,
                message: '昵称不能为空'
            });
        }
        
        // 检查昵称是否已存在
        const existingUser = await UserModel.findUserByNickname(nickname);
        
        if (existingUser) {
            return res.status(200).json({
                success: false,
                message: '该昵称已被使用，请更换其他昵称'
            });
        } else {
            return res.status(200).json({
                success: true,
                message: '该昵称可用'
            });
        }
    } catch (error) {
        console.error('检查昵称唯一性失败:', error.message);
        return res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

/**
 * 修改用户昵称
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @returns {Object} 修改结果响应
 */
exports.updateNickname = async (req, res) => {
    try {
        const { nickname } = req.body;
        
        // 从sessionStorage中获取当前用户名
        // 注意：当前实现中没有使用会话，这里假设前端会在请求中包含用户名
        // 实际生产环境中应该使用会话或JWT令牌来识别用户
        const username = req.body.username || req.headers['x-username'] || sessionStorage.getItem('currentUsername');
        
        if (!username) {
            return res.status(401).json({
                success: false,
                message: '未授权，请先登录'
            });
        }
        
        // 查找用户
        const user = await UserModel.findUserByUsername(username);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }
        
        // 检查昵称是否已存在
        const existingUser = await UserModel.findUserByNickname(nickname);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: '该昵称已被使用，请更换其他昵称'
            });
        }
        
        // 更新用户昵称
        await UserModel.updateUserNickname(user.id, nickname);
        
        return res.status(200).json({
            success: true,
            message: '昵称修改成功'
        });
    } catch (error) {
        console.error('修改昵称失败:', error.message);
        return res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};
