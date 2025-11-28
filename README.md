# yanghao24_login

一个基于Node.js和SQLite的用户登录系统，提供完整的用户注册、登录、密码找回和昵称修改功能。

## 功能特性

### 用户注册
- 用户名、密码、邮箱、手机号验证
- 密码复杂度要求（至少8位，包含大小写字母和数字）
- 安全问题和答案设置
- 昵称唯一性校验

### 用户登录
- 用户名密码验证
- 账号状态检查
- 最后登录时间更新
- 完整用户信息返回

### 密码找回
- 用户名验证
- 安全问题验证
- 密码重置功能

### 昵称管理
- 登录后可修改昵称
- 昵称唯一性实时校验
- 昵称修改成功后即时更新

## 技术栈

### 后端
- **框架**: Express.js
- **数据库**: SQLite
- **密码加密**: bcrypt
- **输入验证**: express-validator
- **安全中间件**: helmet, cors

### 前端
- HTML5
- CSS3
- JavaScript (原生)

### 测试
- **API 测试**: Jest + supertest
- **E2E 测试**: Playwright

## 项目结构

```
yanghao24_login/
├── server/                 # 后端代码
│   ├── config/             # 配置文件
│   │   └── db.js           # 数据库配置
│   ├── controllers/        # 请求处理器
│   │   └── userController.js  # 用户相关业务逻辑
│   ├── models/             # 数据模型
│   │   └── userModel.js    # 用户数据操作
│   ├── routes/             # 路由定义
│   │   └── userRoutes.js   # 用户相关 API 路由
│   ├── utils/              # 工具函数
│   │   ├── dbConnection.js # 数据库连接
│   │   └── initDb.js       # 数据库初始化
│   └── server.js           # 服务器入口
├── public/                 # 前端静态文件
│   ├── css/                # 样式文件
│   ├── js/                 # JavaScript 文件
│   ├── login.html          # 登录页面
│   ├── register.html       # 注册页面
│   ├── dashboard.html      # 仪表盘页面
│   ├── nickname-edit.html  # 昵称修改页面
│   ├── nickname-success.html # 昵称修改成功页面
│   └── register-success.html # 注册成功页面
├── tests/                  # 测试文件
│   ├── api/                # API 测试
│   └── e2e/                # 端到端测试
├── .env                    # 环境变量配置
├── package.json            # 项目依赖和脚本
└── README.md               # 项目说明文档
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3000 上运行

### 启动生产服务器

```bash
npm start
```

## API 端点

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | /api/users/register | 用户注册 |
| POST | /api/users/login | 用户登录 |
| GET | /api/users/:id | 获取用户信息 |
| POST | /api/users/check-nickname | 检查昵称唯一性 |
| POST | /api/users/update-nickname | 修改用户昵称 |
| POST | /api/users/forgot-password/verify-username | 验证用户名 |
| POST | /api/users/forgot-password/get-security-question | 获取安全问题 |
| POST | /api/users/forgot-password/verify-answer | 验证安全答案 |
| POST | /api/users/forgot-password/reset | 重置密码 |

## 环境变量配置

在项目根目录创建 `.env` 文件，包含以下配置：

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_PATH=./users.db

# Security Configuration
JWT_SECRET=your_jwt_secret_key_here
BCRYPT_SALT_ROUNDS=10
```

## 运行测试

### API 测试

```bash
npm test
```

### E2E 测试

```bash
npm run test:e2e
```

## 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

ISC
