# AiPromptHub 前端

Next.js App Router + Tailwind CSS v4 + Framer Motion。UI 模式参考 [Aceternity UI](https://ui.aceternity.com/)（背景渐变、聚光灯卡片、悬浮顶栏等）。

## 本地开发

1. 复制环境变量：`cp .env.local.example .env.local`（默认指向 `http://127.0.0.1:3000/api`）
2. 先启动仓库根目录下的 `back` 服务
3. `npm install` 后执行 `npm run dev`，浏览器访问 **http://127.0.0.1:5173**

## 脚本

- `npm run dev`：开发（端口 5173）
- `npm run build`：生产构建
- `npm run start`：运行生产构建（默认端口 3000，与后端冲突时请指定端口）
