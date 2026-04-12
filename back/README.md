# AI Prompt Hub Backend

基于 `Express.js + Sequelize + MySQL 8` 实现的 AI Prompt Hub 后端项目，提供统一响应格式、JWT 鉴权、评论树、分页查询、逻辑删除，以及 Swagger 在线调试和 OpenAPI 文档导出能力。

## 技术栈

- Node.js 18+
- Express 4
- Sequelize 6
- MySQL 8
- JWT
- bcryptjs
- express-validator
- swagger-jsdoc
- swagger-ui-express

## 目录结构

```text
src/
  app.js
  server.js
  config/
  controllers/
  middlewares/
  models/
  routes/
  services/
  utils/
  docs/
scripts/
  init.js
  exportSwagger.js
database/
  README.md
  tables.sql
  data.sql
swagger/
  openapi.json
```

## 环境变量

项目已附带本地开发用 `.env`，数据库配置如下：

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ai_prompt_hub
DB_USER=root
DB_PASSWORD=QQ666666
```

## 启动命令

```bash
npm install
npm run db:init
npm run dev
npm start
npm run docs:build
```

## 接口文档

启动后可访问：

- `http://127.0.0.1:3000/api-docs`
- `http://127.0.0.1:3000/api-docs.json`

导出静态 OpenAPI JSON：

```bash
npm run docs:build
```

输出文件：`swagger/openapi.json`

## 默认管理员账号

执行 `npm run db:init` 后会写入一个超级管理员账号：

- 用户名：`superadmin`
- 密码：`Admin@123456`
