# 数据库文件（仅两个）

| 文件 | 内容 |
|------|------|
| `tables.sql` | 最终表结构：建库、`DROP`、`CREATE TABLE` |
| `data.sql` | 最终数据：分类、标签、`superadmin`（id=1）、**100 条 Prompt**、`prompt_tag` |

初始化：

```bash
npm run db:init
```

等价于按顺序执行上述两个 SQL 文件（见 `scripts/init.js`）。
