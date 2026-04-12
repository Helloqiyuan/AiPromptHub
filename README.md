# AiPromptHub

## 目录结构

- `back`：Express + MySQL 后端
- `front`：Vue 3 + TypeScript 前端
- `docs-src` / `docs-extract`：原始文档与提取内容

## 启动方式

### 后端

```bash
npm --prefix back install
npm --prefix back run db:init
npm --prefix back run dev
```

### 前端

```bash
npm --prefix front install
npm --prefix front run dev
```

## 默认地址

- 后端：`http://127.0.0.1:3000`
- 前端：`http://127.0.0.1:5173`
