USE `ai_prompt_hub`;

INSERT INTO `category` (`id`, `name`, `description`, `parent_id`, `sort`)
VALUES
  (1, 'AIGC大类', '人工智能生成内容总类', -1, 0),
  (2, '文本生成', '对话、摘要、翻译、写作等文本类 AIGC', 1, 10),
  (3, '图像生成', '文生图、图生图、修图等', 1, 20),
  (4, '音频生成', '语音合成、音乐生成等', 1, 30),
  (5, '视频生成', '文生视频、剪辑辅助等', 1, 40),
  (6, '代码生成', '代码补全、解释、重构等', 1, 50)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `parent_id` = VALUES(`parent_id`),
  `sort` = VALUES(`sort`),
  `deleted` = 0;

-- 三级分类：各二级类下的代表性模型/产品名（仅写 category 表，name 全局唯一）
-- 命名参考各厂商公开产品线（OpenAI / Anthropic / Google / 开源与垂直场景等）
INSERT INTO `category` (`id`, `name`, `description`, `parent_id`, `sort`)
VALUES
  (7, 'GPT-5.4', 'OpenAI 旗舰：对话、长文与工具调用（2026 公开路线）', 2, 10),
  (8, 'Claude Opus 4.6', 'Anthropic 旗舰：长上下文写作与复杂推理', 2, 20),
  (9, 'Gemini 2.5 Pro', 'Google：多模态与超长上下文文本任务', 2, 30),
  (10, 'DeepSeek-V3', 'DeepSeek：中文与代码混合场景文本生成', 2, 40),
  (11, 'Qwen3-Max', '阿里通义：中文写作与知识问答', 2, 50),
  (12, 'DALL·E 3', 'OpenAI 文生图与指令遵循', 3, 10),
  (13, 'Midjourney V7', 'Midjourney 高质量艺术与风格化图像', 3, 20),
  (14, 'Stable Diffusion 3.5', 'Stability AI 开源可控文生图管线', 3, 30),
  (15, 'Flux.1 Pro', 'Black Forest Labs 高细节文生图', 3, 40),
  (16, 'Imagen 3', 'Google 写实与产品图方向', 3, 50),
  (17, 'ElevenLabs Turbo v3', '多语种神经语音合成（TTS）', 4, 10),
  (18, 'Suno v4', 'AI 歌曲与编曲生成', 4, 20),
  (19, 'Udio', '人声与音乐生成创作', 4, 30),
  (20, 'AudioCraft 2', 'Meta 音频生成工具链（音乐/音效）', 4, 40),
  (21, 'Bark v2', 'Suno 系多语言语音合成与音效', 4, 50),
  (22, 'Sora 2', 'OpenAI 文生视频与镜头语言', 5, 10),
  (23, 'Runway Gen-4', 'Runway 视频生成与编辑工作流', 5, 20),
  (24, 'Kling 2.1', '可灵：中文短视频与镜头运动', 5, 30),
  (25, 'Luma Ray3', 'Luma Dream Machine 系列文生视频', 5, 40),
  (26, 'Pika 2.0', 'Pika：短视频与风格化生成', 5, 50),
  (27, 'GPT-5.4-Codex', 'OpenAI 代码智能体与仓库级任务（对标 Codex 产品线）', 6, 10),
  (28, 'Claude Sonnet 4.5 Dev', 'Anthropic：终端与 SWE 向代码任务', 6, 20),
  (29, 'Gemini 2.5 Code Assist', 'Google：IDE 与 Cloud 代码助手向能力', 6, 30),
  (30, 'DeepSeek-Coder-V2', 'DeepSeek 代码补全与仓库理解', 6, 40),
  (31, 'GitHub Copilot Agent', 'GitHub：编辑器与 Agent 式编码工作流', 6, 50)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `parent_id` = VALUES(`parent_id`),
  `sort` = VALUES(`sort`),
  `deleted` = 0;

INSERT INTO `tag` (`id`, `name`)
VALUES
  (1, '写作'),
  (2, '编程'),
  (3, '总结'),
  (4, '翻译'),
  (5, '面试')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `deleted` = 0;

INSERT INTO `user` (`username`, `email`, `password`, `role`, `status`)
VALUES
  ('superadmin', 'superadmin@local.ai-prompt-hub', '$2a$10$XXrwTkA9ZTrDoigTXF4g.ezX0Di8hu/T7bRdJyADi7qav9a8xWfjW', 'super_admin', 'active')
ON DUPLICATE KEY UPDATE
  `password` = VALUES(`password`),
  `role` = VALUES(`role`),
  `status` = VALUES(`status`),
  `deleted` = 0;
