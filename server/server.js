#!/usr/bin/env node

/**
 * 用户信息管理系统 - 服务器入口文件
 * 负责初始化Express服务器、配置中间件和路由
 */

// 引入依赖包
const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 配置中间件
app.use(helmet()); // 安全头部设置
app.use(cors()); // 跨域资源共享
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码请求体
app.use(express.static(path.join(__dirname, '../public'))); // 静态文件服务

// 引入路由
const userRoutes = require('./routes/userRoutes');

// 使用路由
app.use('/api/users', userRoutes);

// 根路径重定向到登录页面
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// 404处理
app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// 获取端口号
const PORT = process.env.PORT || 3000;

// 启动服务器，监听所有IP地址
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Server is also accessible on http://0.0.0.0:${PORT}`);
    console.log(`You can access it from other devices on the same network using your IP address: http://<your-ip>:${PORT}`);
});

module.exports = app;
