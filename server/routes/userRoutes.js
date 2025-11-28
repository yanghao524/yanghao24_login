/**
 * 用户路由
 * 定义用户相关的API路由
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * 用户注册路由
 * POST /api/users/register
 */
router.post(
    '/register',
    userController.registerValidationRules,
    userController.handleValidationErrors,
    userController.register
);

/**
 * 用户登录路由
 * POST /api/users/login
 */
router.post(
    '/login',
    userController.loginValidationRules,
    userController.handleValidationErrors,
    userController.login
);

/**
 * 获取用户信息路由
 * GET /api/users/:id
 */
router.get('/:id', userController.getUserInfo);

/**
 * 检查昵称唯一性
 * POST /api/users/check-nickname
 */
router.post('/check-nickname', userController.checkNickname);

/**
 * 修改昵称
 * POST /api/users/update-nickname
 */
router.post('/update-nickname', userController.updateNickname);

/**
 * 密码找回 - 验证用户名
 * POST /api/users/forgot-password/verify-username
 */
router.post('/forgot-password/verify-username', userController.verifyUsername);

/**
 * 密码找回 - 获取安全问题
 * POST /api/users/forgot-password/get-security-question
 */
router.post('/forgot-password/get-security-question', userController.getSecurityQuestion);

/**
 * 密码找回 - 验证安全答案
 * POST /api/users/forgot-password/verify-answer
 */
router.post('/forgot-password/verify-answer', userController.verifySecurityAnswer);

/**
 * 密码找回 - 重置密码
 * POST /api/users/forgot-password/reset
 */
router.post('/forgot-password/reset', userController.resetPassword);

module.exports = router;
