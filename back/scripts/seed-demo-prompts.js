/**
 * 若 `prompt` 表当前无有效记录（deleted=0），则插入 20 条演示 Prompt，
 * 并随机关联已有 category（需先执行过 db:init 或存在基础目录数据）。
 * 用法：npm run db:seed-demo
 */
const mysql = require('mysql2/promise');
const env = require('../src/config/env');

/** 20 条演示文案（标题、摘要、正文等） */
const DEMO_PROMPTS = [
  {
    title: '中文文章润色助手',
    summary: '将草稿润色为更自然、专业的中文表达。',
    content: '你是一位资深中文编辑。请在不改变原意的前提下，润色以下文本，修正语病并提升可读性：\n\n{{原文}}',
    usageScenario: '公众号、报告、邮件润色',
  },
  {
    title: '代码审查清单',
    summary: '按维度检查 Pull Request 的质量与风险。',
    content: '你是资深工程师。请根据以下 diff 输出：1) 潜在 bug 2) 性能问题 3) 命名与风格建议 4) 测试建议。\n\n```diff\n{{diff}}\n```',
    usageScenario: '团队 Code Review',
  },
  {
    title: '会议纪要结构化',
    summary: '把口语化会议记录整理成条目清晰的纪要。',
    content: '将以下会议速记整理为：议题 / 决议 / 待办（负责人+截止时间） / 风险。\n\n{{notes}}',
    usageScenario: '周会、项目例会',
  },
  {
    title: 'SQL 编写与解释',
    summary: '根据自然语言生成 SQL 并解释每一步。',
    content: '数据库为 MySQL 8。表结构如下：\n{{schema}}\n\n需求：{{question}}\n请给出 SQL 并简要解释。',
    usageScenario: '数据分析、报表',
  },
  {
    title: '英文邮件礼貌改写',
    summary: '把直译腔英文改成地道商务邮件。',
    content: '请将下列中文意图改写成英文商务邮件，语气{{tone}}，长度适中：\n\n{{draft}}',
    usageScenario: '对外合作、客户沟通',
  },
  {
    title: '产品经理 PRD 骨架',
    summary: '从一句话需求扩展成 PRD 大纲。',
    content: '根据一句话需求生成 PRD 大纲：背景、目标用户、用户故事、功能列表、非功能、里程碑、风险。\n需求：{{idea}}',
    usageScenario: '需求评审前草稿',
  },
  {
    title: '学习路径规划',
    summary: '为指定主题生成 4 周入门到进阶路线。',
    content: '学习主题为：{{topic}}。请输出：每周目标、推荐资源类型、练习建议、自测方式。',
    usageScenario: '自学编程、外语、考证',
  },
  {
    title: '正则表达式生成',
    summary: '用自然语言描述匹配规则，输出生成正则与示例。',
    content: '请为以下匹配需求生成正则（注明语言 flavor），并给 3 个匹配/不匹配示例：\n{{desc}}',
    usageScenario: '日志解析、表单校验',
  },
  {
    title: '竞品功能对比表',
    summary: '把零散信息整理成对比矩阵。',
    content: '请将以下竞品信息整理为 Markdown 表格，维度包括：定价、核心功能、集成、适用场景、优缺点。\n\n{{raw}}',
    usageScenario: '产品调研',
  },
  {
    title: '报错日志诊断',
    summary: '根据堆栈与上下文给出可能原因与排查步骤。',
    content: '运行环境：{{env}}\n错误信息：\n{{error}}\n\n请给出：最可能原因排序、验证步骤、修复建议。',
    usageScenario: '线上故障排查',
  },
  {
    title: '面试行为题 STAR',
    summary: '把经历改写成 STAR 结构回答。',
    content: '岗位：{{role}}\n考察点：{{competency}}\n我的经历要点：{{bullets}}\n请生成 150–250 字的 STAR 回答。',
    usageScenario: '求职面试准备',
  },
  {
    title: '数据指标定义',
    summary: '把业务口语指标写成可计算的口径说明。',
    content: '业务场景：{{biz}}\n指标名称：{{metric}}\n请输出：定义、计算公式、边界情况、与相关指标关系。',
    usageScenario: '埋点与看板对齐',
  },
  {
    title: '用户反馈聚类',
    summary: '将多条反馈归类并提炼主题与优先级。',
    content: '以下是用户反馈列表（每条一行）：\n{{lines}}\n请输出：主题聚类、每类代表问题、建议优先级（P0-P2）。',
    usageScenario: '客服与产品复盘',
  },
  {
    title: 'API 文档补全',
    summary: '根据路由与字段草稿生成 OpenAPI 风格说明。',
    content: '端点：{{method}} {{path}}\n字段：{{fields}}\n请补全：摘要、请求示例、响应示例、错误码说明。',
    usageScenario: '前后端联调',
  },
  {
    title: '短视频脚本分镜',
    summary: '把主题扩写为 60 秒口播分镜。',
    content: '主题：{{topic}}\n风格：{{style}}\n请输出：每 5 秒一行的分镜（画面+口播要点），共约 60 秒。',
    usageScenario: '自媒体创作',
  },
  {
    title: '合同条款风险提示',
    summary: '标出不对等或模糊条款并给修改建议。',
    content: '以下为合同节选，立场为{{party}}：\n{{clause}}\n请列出风险点、建议修改方向（不替代律师意见）。',
    usageScenario: '商务初审（非法律意见）',
  },
  {
    title: 'Prompt 本身优化',
    summary: '让模型帮你迭代自己的提示词。',
    content: '原始任务：{{task}}\n当前 Prompt：\n{{prompt}}\n请输出改进版 Prompt，并说明改动理由。',
    usageScenario: '提示词工程',
  },
  {
    title: '多语言术语表',
    summary: '给定中文术语生成英日对照与使用语境。',
    content: '领域：{{domain}}\n术语列表：{{terms}}\n请输出表格：中文、英文、日文、备注（使用语境）。',
    usageScenario: '本地化与文档',
  },
  {
    title: '读书摘要卡片',
    summary: '按固定模板输出一章书的要点卡片。',
    content: '书名：{{book}}\n章节：{{chapter}}\n请输出：核心论点、论据、可行动清单、与我工作的关联。',
    usageScenario: '读书笔记',
  },
  {
    title: '健身周计划草稿',
    summary: '根据目标与约束生成一周训练安排。',
    content: '目标：{{goal}}\n可用器材：{{equipment}}\n每周可练天数：{{days}}\n伤病史：{{injury}}\n请给出一周日历（动作+组数区间+休息建议）。',
    usageScenario: '个人训练规划（非医疗建议）',
  },
];

async function main() {
  // 使用与后端一致的 .env 数据库配置
  const conn = await mysql.createConnection({
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    multipleStatements: false,
  });

  try {
    // 仅当「有效 Prompt」为空时插入，避免重复灌入
    const [[countRow]] = await conn.query(
      'SELECT COUNT(*) AS c FROM `prompt` WHERE `deleted` = 0',
    );
    const existing = Number(countRow.c);
    if (existing > 0) {
      console.log(`[seed-demo] prompt 表已有 ${existing} 条未删除记录，跳过插入。`);
      return;
    }

    const [users] = await conn.query(
      "SELECT `id` FROM `user` WHERE `deleted` = 0 AND `status` = 'active' ORDER BY `id` ASC LIMIT 1",
    );
    if (!users.length) {
      console.error('[seed-demo] 未找到可用用户，请先执行: npm run db:init');
      process.exitCode = 1;
      return;
    }
    const userId = users[0].id;

    const [cats] = await conn.query(
      'SELECT `id` FROM `category` WHERE `deleted` = 0 ORDER BY `sort` ASC, `id` ASC',
    );
    if (!cats.length) {
      console.error('[seed-demo] 未找到分类，请先执行: npm run db:init');
      process.exitCode = 1;
      return;
    }

    await conn.beginTransaction();

    let inserted = 0;
    for (let i = 0; i < DEMO_PROMPTS.length; i += 1) {
      const d = DEMO_PROMPTS[i];
      const categoryId = cats[i % cats.length].id;

      const [result] = await conn.query(
        `INSERT INTO \`prompt\` (
          \`title\`, \`summary\`, \`content\`, \`usage_scenario\`,
          \`user_id\`, \`category_id\`,
          \`like_count\`, \`favorite_count\`, \`comment_count\`,
          \`status\`, \`deleted\`
        ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, 'published', 0)`,
        [d.title, d.summary, d.content, d.usageScenario, userId, categoryId],
      );

      // 为演示数据挂 1～2 个标签（多对多 prompt_tag）
      const promptId = result.insertId;
      const tagA = (i % 5) + 1;
      const tagB = ((i + 2) % 5) + 1;
      await conn.query(
        'INSERT INTO `prompt_tag` (`prompt_id`, `tag_id`) VALUES (?, ?), (?, ?)',
        [promptId, tagA, promptId, tagB],
      );

      inserted += 1;
    }

    await conn.commit();
    console.log(`[seed-demo] 已插入 ${inserted} 条演示 Prompt（user_id=${userId}）。`);
  } catch (err) {
    await conn.rollback();
    console.error('[seed-demo] 失败:', err.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

main();
