# AiPromptHub

## 目录结构

- `back`：Express + MySQL 后端
- `front`：Vue 3 + Vite 前端
- `docs-src` / `docs-extract`：原始文档与提取内容

## 根目录一键命令

```bash
npm run back:install
npm run back:db:init
npm run back:dev
npm run back:start
npm run back:docs
npm run front:install
npm run front:dev
npm run front:build
```

## Windows 一键脚本

直接在项目根目录双击即可：

- `init-back-db.bat`：初始化后端数据库
- `start-back-dev.bat`：开发模式启动后端
- `start-back.bat`：生产模式启动后端

## 接口文档

后端启动后可访问：

- `http://127.0.0.1:3000/api-docs`
- `http://127.0.0.1:3000/api-docs.json`

导出静态 OpenAPI JSON：

```bash
npm run back:docs
```

导出文件：`back/swagger/openapi.json`

## 默认地址

- 后端：`http://127.0.0.1:3000`
- 前端：`http://127.0.0.1:5173`
