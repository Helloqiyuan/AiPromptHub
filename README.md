# AiPromptHub

## 目录结构

- `back`：Express + MySQL 后端
- `front`：Next.js 前端（Civitai 风格 + Aceternity UI 组件模式）
- `docs-src` / `docs-extract`：原始文档与提取内容

## 启动方式

### 后端

```bash
npm --prefix back install
npm --prefix back run db:init
npm --prefix back run dev
```

`db:init` 会执行 `back/database/tables.sql` 与 `data.sql`（已含 100 条演示 Prompt 及封面 URL）。

### 前端

```bash
cp front/.env.local.example front/.env.local
npm --prefix front install
npm --prefix front run dev
```

## 默认地址

- 后端：`http://127.0.0.1:3000`
- 前端：`http://127.0.0.1:5173`（开发端口在 `front/package.json` 的 `dev` 脚本中配置）
