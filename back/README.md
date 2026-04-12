# AI Prompt Hub Backend

基于 `Express.js + Sequelize + MySQL 8` 实现的 AI Prompt Hub 后端项目，按照文档要求提供统一响应格式、JWT 鉴权、评论树、分页查询、逻辑删除，以及更规范化的标签/模型/点赞/收藏设计。

## 技术栈

- Node.js 18+
- Express 4
- Sequelize 6
- MySQL 8
- JWT
- bcryptjs
- express-validator

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
scripts/
  init.js                # npm run db:init → 执行 database/tables.sql + data.sql
database/
  README.md
  tables.sql             # 最终表结构（DDL）
  data.sql               # 最终种子数据（DML，含 100 条 Prompt）
```

## 已实现模块

- 用户模块：注册、登录、获取个人信息、更新个人资料
- Prompt 模块：分页列表、详情、创建、编辑、逻辑删除
- 互动模块：点赞切换、收藏切换、评论新增、评论树、评论递归删除
- 个人中心：我的发布、我的收藏、我的评论
- 目录模块：分类列表、标签列表、模型列表、管理员创建分类
- 管理后台：Prompt 状态审核、逻辑删除、用户列表、统计数据、角色与状态管理

## 环境变量

项目已附带本地开发用 `.env`，数据库配置如下：

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ai_prompt_hub
DB_USER=root
DB_PASSWORD=QQ666666
```

## 启动步骤

1. 安装依赖

```bash
npm install
```

2. 初始化数据库（会重建 ai_prompt_hub 中本项目相关表）

```bash
npm run db:init
```

3. 启动开发服务器

```bash
npm run dev
```

4. 生产启动

```bash
npm start
```

## 接口前缀

- Base URL: `/api`
- 健康检查: `GET /health`

## 统一响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

## 核心接口示例

### 用户

- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/me`
- `PUT /api/users/me`

### Prompt

- `GET /api/prompts`
- `GET /api/prompts/:id`
- `POST /api/prompts`
- `PUT /api/prompts/:id`
- `DELETE /api/prompts/:id`
- `POST /api/prompts/:id/likes/toggle`
- `POST /api/prompts/:id/favorites/toggle`

### 评论

- `POST /api/comments`
- `GET /api/comments/tree?promptId=1`
- `DELETE /api/comments/:id`

### 个人中心

- `GET /api/users/me/prompts`
- `GET /api/users/me/favorites`
- `GET /api/users/me/comments`

### 管理端

- `GET /api/admin/stats`
- `GET /api/admin/prompts`
- `PATCH /api/admin/prompts/:id/status`
- `DELETE /api/admin/prompts/:id`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/role`
- `PATCH /api/admin/users/:id/status`

## 说明

- 所有表统一包含 `create_time`、`update_time`、`deleted`
- 数据库层不建立外键约束，删除统一采用逻辑删除
- 评论通过 `parent_id` 构建树结构
- 标签、模型、点赞都做了规范化拆表，避免冗余字段
- 接口参数使用 `express-validator` 做基础校验


## 默认管理员账号

执行 `npm run db:init` 后会写入一个超级管理员账号：

- 用户名：`superadmin`
- 密码：`Admin@123456`

## Swagger 接口文档

启动后可访问：

- `http://127.0.0.1:3000/api-docs`
- `http://127.0.0.1:3000/api-docs.json`

在 Swagger 页面右上角点击 `Authorize`，填入 `Bearer {你的token}` 就可以直接测试需要鉴权的接口。
