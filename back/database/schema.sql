-- =============================================================================
-- AiPromptHub 数据库结构
-- 字符集：utf8mb4（兼容 emoji 与多语言）；排序：utf8mb4_bin（区分大小写）
-- 说明：业务表（user / category / tag / prompt / favorite / comment / prompt_like）
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `ai_prompt_hub`
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_bin;

USE `ai_prompt_hub`;

-- 删除顺序：先子表后父表，避免外键或逻辑依赖问题（当前未建物理外键）
DROP TABLE IF EXISTS `comment`;
DROP TABLE IF EXISTS `favorite`;
DROP TABLE IF EXISTS `prompt_like`;
DROP TABLE IF EXISTS `prompt_tag`;
DROP TABLE IF EXISTS `prompt`;
DROP TABLE IF EXISTS `tag`;
DROP TABLE IF EXISTS `category`;
DROP TABLE IF EXISTS `user`;

-- -----------------------------------------------------------------------------
-- 用户表：登录账号与角色、软删与审计字段
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增用户 ID',
  `username` VARCHAR(50) NOT NULL COMMENT '登录名，全局唯一',
  `email` VARCHAR(100) NULL COMMENT '邮箱，可空，全局唯一',
  `phone` VARCHAR(20) NULL COMMENT '手机号，可空，全局唯一',
  `password` VARCHAR(255) NOT NULL COMMENT '密码哈希（如 bcrypt），禁止明文存储',
  `avatar` VARCHAR(255) NULL COMMENT '头像 URL',
  `bio` VARCHAR(255) NULL COMMENT '个人简介',
  `role` VARCHAR(20) NOT NULL DEFAULT 'user' COMMENT '角色：user / admin / super_admin',
  `status` VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '账号状态：active 可用 / disabled 禁用',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  `deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否 / 1 是',
  `create_by` BIGINT UNSIGNED NULL COMMENT '创建人，对应 user.id，种子或系统行为可为 NULL',
  `deleted_by` BIGINT UNSIGNED NULL COMMENT '执行软删操作的用户 ID，未删则为 NULL',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_username` (`username`),
  UNIQUE KEY `uk_user_email` (`email`),
  UNIQUE KEY `uk_user_phone` (`phone`),
  KEY `idx_user_role` (`role`) COMMENT '按角色筛选',
  KEY `idx_user_status` (`status`) COMMENT '按状态筛选',
  KEY `idx_user_deleted` (`deleted`) COMMENT '按是否删除筛选'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='用户账号与权限';

-- -----------------------------------------------------------------------------
-- 分类表：支持树形（parent_id），名称全局唯一
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `category` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增分类 ID',
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称，全局唯一',
  `description` VARCHAR(255) NULL COMMENT '分类说明',
  `parent_id` BIGINT NOT NULL DEFAULT -1 COMMENT '父级分类 ID；-1 表示根节点（无父级）',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '同级排序，数值越小越靠前',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  `deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否 / 1 是',
  `create_by` BIGINT UNSIGNED NULL COMMENT '创建人 user.id',
  `deleted_by` BIGINT UNSIGNED NULL COMMENT '软删除操作人 user.id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_category_name` (`name`),
  KEY `idx_category_deleted_sort` (`deleted`, `sort`) COMMENT '列表：未删数据按 sort 排序',
  KEY `idx_category_parent` (`parent_id`) COMMENT '按父级查询子分类'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='Prompt 分类目录（树形）';

-- -----------------------------------------------------------------------------
-- 标签表：全局标签字典（名称唯一；与 Prompt 的多对多若需另建 prompt_tag）
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tag` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增标签 ID',
  `name` VARCHAR(50) NOT NULL COMMENT '标签名，全局唯一',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  `deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否 / 1 是',
  `create_by` BIGINT UNSIGNED NULL COMMENT '创建人 user.id',
  `deleted_by` BIGINT UNSIGNED NULL COMMENT '软删除操作人 user.id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tag_name` (`name`),
  KEY `idx_tag_deleted` (`deleted`) COMMENT '过滤未删标签'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='标签字典';

-- -----------------------------------------------------------------------------
-- Prompt 表：正文与元数据、计数器冗余、审核状态
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `prompt` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增 Prompt ID',
  `title` VARCHAR(150) NOT NULL COMMENT '标题',
  `summary` VARCHAR(255) NULL COMMENT '摘要，列表展示用',
  `content` LONGTEXT NOT NULL COMMENT '正文（完整提示词内容）',
  `usage_scenario` VARCHAR(255) NULL COMMENT '适用场景说明',
  `example_input` TEXT NULL COMMENT '示例输入',
  `example_output` TEXT NULL COMMENT '示例输出',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '作者用户 ID，关联 user.id',
  `category_id` BIGINT UNSIGNED NOT NULL COMMENT '所属分类 ID，关联 category.id',
  `like_count` INT NOT NULL DEFAULT 0 COMMENT '点赞数冗余（当前业务可为 0）',
  `favorite_count` INT NOT NULL DEFAULT 0 COMMENT '收藏人数冗余',
  `comment_count` INT NOT NULL DEFAULT 0 COMMENT '评论数冗余（含子回复统计策略由业务决定）',
  `status` VARCHAR(20) NOT NULL DEFAULT 'published' COMMENT '状态：published / pending / rejected / archived',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  `deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否 / 1 是',
  `create_by` BIGINT UNSIGNED NULL COMMENT '创建人 user.id',
  `deleted_by` BIGINT UNSIGNED NULL COMMENT '软删除操作人 user.id',
  PRIMARY KEY (`id`),
  KEY `idx_prompt_user_id` (`user_id`) COMMENT '按作者查 Prompt',
  KEY `idx_prompt_category_id` (`category_id`) COMMENT '按分类筛选',
  KEY `idx_prompt_status` (`status`) COMMENT '按状态筛选（审核流）',
  KEY `idx_prompt_deleted` (`deleted`) COMMENT '过滤已删数据',
  KEY `idx_prompt_create_time` (`create_time`) COMMENT '按时间排序或范围查询'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='用户发布的 Prompt 主表';

-- -----------------------------------------------------------------------------
-- Prompt 与 Tag 多对多：中间表 + 外键（一个 Prompt 可挂多个标签）
-- 若旧库曾用 prompt.tag_id 单列，可手动迁移后删列：
-- INSERT INTO prompt_tag (prompt_id, tag_id) SELECT id, tag_id FROM prompt WHERE tag_id IS NOT NULL;
-- ALTER TABLE prompt DROP COLUMN tag_id;
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `prompt_tag` (
  `prompt_id` BIGINT UNSIGNED NOT NULL COMMENT 'Prompt ID，关联 prompt.id',
  `tag_id` BIGINT UNSIGNED NOT NULL COMMENT '标签 ID，关联 tag.id',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '关联创建时间',
  PRIMARY KEY (`prompt_id`, `tag_id`),
  KEY `idx_prompt_tag_tag_id` (`tag_id`) COMMENT '按标签反查 Prompt',
  CONSTRAINT `fk_prompt_tag_prompt` FOREIGN KEY (`prompt_id`) REFERENCES `prompt` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_prompt_tag_tag` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='Prompt 与标签多对多关联';

-- -----------------------------------------------------------------------------
-- 收藏表：用户对 Prompt 的收藏关系（可软删取消）
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `favorite` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `prompt_id` BIGINT UNSIGNED NOT NULL COMMENT '被收藏的 Prompt ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '收藏人用户 ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '首次收藏时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间（含取消收藏恢复）',
  `deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 有效收藏 / 1 已取消',
  `create_by` BIGINT UNSIGNED NULL COMMENT '创建人 user.id（通常同 user_id）',
  `deleted_by` BIGINT UNSIGNED NULL COMMENT '软删除操作人 user.id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_favorite_unique` (`prompt_id`, `user_id`) COMMENT '同一用户对同一 Prompt 仅一条有效关联',
  KEY `idx_favorite_prompt_id` (`prompt_id`) COMMENT '按 Prompt 聚合收藏',
  KEY `idx_favorite_user_id` (`user_id`) COMMENT '查询某用户收藏列表',
  KEY `idx_favorite_deleted` (`deleted`) COMMENT '过滤有效收藏'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='用户收藏 Prompt';

-- -----------------------------------------------------------------------------
-- 评论表：树形回复（parent_id）、可选回复对象（reply_user_id）
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `comment` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，评论 ID',
  `prompt_id` BIGINT UNSIGNED NOT NULL COMMENT '所属 Prompt ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '评论人用户 ID',
  `parent_id` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '父评论 ID；0 表示顶层评论',
  `reply_user_id` BIGINT UNSIGNED NULL COMMENT '被回复用户 ID，顶层评论可为 NULL',
  `content` TEXT NOT NULL COMMENT '评论正文',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  `deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 否 / 1 是',
  `create_by` BIGINT UNSIGNED NULL COMMENT '创建人 user.id',
  `deleted_by` BIGINT UNSIGNED NULL COMMENT '软删除操作人 user.id',
  PRIMARY KEY (`id`),
  KEY `idx_comment_prompt_id` (`prompt_id`) COMMENT '某 Prompt 下评论列表',
  KEY `idx_comment_user_id` (`user_id`) COMMENT '某用户发表的评论',
  KEY `idx_comment_parent_id` (`parent_id`) COMMENT '构建评论树、查子回复',
  KEY `idx_comment_reply_user_id` (`reply_user_id`) COMMENT '按被回复人查询',
  KEY `idx_comment_deleted` (`deleted`) COMMENT '过滤已删评论'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='Prompt 评论与回复';

-- -----------------------------------------------------------------------------
-- 点赞表：用户对 Prompt 的点赞（软删表示取消，与 prompt.like_count 由业务同步）
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `prompt_like` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `prompt_id` BIGINT UNSIGNED NOT NULL COMMENT '被点赞的 Prompt ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '点赞用户 ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '首次点赞时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间（含取消点赞恢复）',
  `deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 有效点赞 / 1 已取消',
  `create_by` BIGINT UNSIGNED NULL COMMENT '创建人 user.id（通常同 user_id）',
  `deleted_by` BIGINT UNSIGNED NULL COMMENT '软删除操作人 user.id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_prompt_like_unique` (`prompt_id`, `user_id`) COMMENT '同一用户对同一 Prompt 仅一条点赞记录',
  KEY `idx_prompt_like_prompt_id` (`prompt_id`) COMMENT '按 Prompt 统计点赞',
  KEY `idx_prompt_like_user_id` (`user_id`) COMMENT '某用户点赞过的 Prompt',
  KEY `idx_prompt_like_deleted` (`deleted`) COMMENT '过滤有效点赞'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='用户对 Prompt 的点赞';
