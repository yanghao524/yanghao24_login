# 使用官方Node.js 20.x LTS镜像作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json到工作目录
COPY package*.json ./

# 安装项目依赖
RUN npm ci --only=production

# 复制项目文件到工作目录
COPY . .

# 暴露应用运行的端口（与server.js中配置的端口一致）
EXPOSE 3000

# 定义环境变量
ENV NODE_ENV=production
ENV DB_PATH=users.db

# 启动应用的命令
CMD ["node", "server/server.js"]
