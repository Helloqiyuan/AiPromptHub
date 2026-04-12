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

INSERT INTO `ai_model` (`name`, `vendor`, `description`)
VALUES
  ('GPT-4o', 'OpenAI', '通用多模态模型'),
  ('GPT-4.1', 'OpenAI', '偏向复杂推理与代码'),
  ('Claude 3.5 Sonnet', 'Anthropic', '偏向稳定写作与分析'),
  ('DeepSeek-V3', 'DeepSeek', '中文能力较强'),
  ('Qwen2.5', 'Alibaba', '通用中文模型')
ON DUPLICATE KEY UPDATE
  `vendor` = VALUES(`vendor`),
  `description` = VALUES(`description`),
  `deleted` = 0;

INSERT INTO `tag` (`name`)
VALUES
  ('写作'),
  ('编程'),
  ('总结'),
  ('翻译'),
  ('面试')
ON DUPLICATE KEY UPDATE
  `deleted` = 0;

INSERT INTO `user` (`username`, `email`, `password`, `role`, `status`)
VALUES
  ('superadmin', 'superadmin@local.ai-prompt-hub', '$2a$10$XXrwTkA9ZTrDoigTXF4g.ezX0Di8hu/T7bRdJyADi7qav9a8xWfjW', 'super_admin', 'active')
ON DUPLICATE KEY UPDATE
  `password` = VALUES(`password`),
  `role` = VALUES(`role`),
  `status` = VALUES(`status`),
  `deleted` = 0;
