CREATE DATABASE IF NOT EXISTS `ai_prompt_hub`
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_bin;

USE `ai_prompt_hub`;

DROP TABLE IF EXISTS `comment`;
DROP TABLE IF EXISTS `favorite`;
DROP TABLE IF EXISTS `prompt_like`;
DROP TABLE IF EXISTS `prompt_model`;
DROP TABLE IF EXISTS `prompt_tag`;
DROP TABLE IF EXISTS `prompt`;
DROP TABLE IF EXISTS `ai_model`;
DROP TABLE IF EXISTS `tag`;
DROP TABLE IF EXISTS `category`;
DROP TABLE IF EXISTS `user`;

CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NULL,
  `phone` VARCHAR(20) NULL,
  `password` VARCHAR(255) NOT NULL,
  `avatar` VARCHAR(255) NULL,
  `bio` VARCHAR(255) NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'user',
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `create_by` BIGINT UNSIGNED NULL COMMENT '创建人 user.id',
  `deleted_by` BIGINT UNSIGNED NULL COMMENT '软删除操作人 user.id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_username` (`username`),
  UNIQUE KEY `uk_user_email` (`email`),
  UNIQUE KEY `uk_user_phone` (`phone`),
  KEY `idx_user_role` (`role`),
  KEY `idx_user_status` (`status`),
  KEY `idx_user_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `category` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NULL,
  `parent_id` BIGINT NOT NULL DEFAULT -1 COMMENT '父级分类 id，-1 表示根节点',
  `sort` INT NOT NULL DEFAULT 0,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `create_by` BIGINT UNSIGNED NULL COMMENT '创建人 user.id',
  `deleted_by` BIGINT UNSIGNED NULL COMMENT '软删除操作人 user.id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_category_name` (`name`),
  KEY `idx_category_deleted_sort` (`deleted`, `sort`),
  KEY `idx_category_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `tag` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `create_by` BIGINT UNSIGNED NULL COMMENT '创建人 user.id',
  `deleted_by` BIGINT UNSIGNED NULL COMMENT '软删除操作人 user.id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tag_name` (`name`),
  KEY `idx_tag_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `ai_model` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `vendor` VARCHAR(50) NULL,
  `description` VARCHAR(255) NULL,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `create_by` BIGINT UNSIGNED NULL COMMENT '创建人 user.id',
  `deleted_by` BIGINT UNSIGNED NULL COMMENT '软删除操作人 user.id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ai_model_name` (`name`),
  KEY `idx_ai_model_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `prompt` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(150) NOT NULL,
  `summary` VARCHAR(255) NULL,
  `content` LONGTEXT NOT NULL,
  `usage_scenario` VARCHAR(255) NULL,
  `example_input` TEXT NULL,
  `example_output` TEXT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `like_count` INT NOT NULL DEFAULT 0,
  `favorite_count` INT NOT NULL DEFAULT 0,
  `comment_count` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(20) NOT NULL DEFAULT 'published',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `create_by` BIGINT UNSIGNED NULL COMMENT '创建人 user.id',
  `deleted_by` BIGINT UNSIGNED NULL COMMENT '软删除操作人 user.id',
  PRIMARY KEY (`id`),
  KEY `idx_prompt_user_id` (`user_id`),
  KEY `idx_prompt_category_id` (`category_id`),
  KEY `idx_prompt_status` (`status`),
  KEY `idx_prompt_deleted` (`deleted`),
  KEY `idx_prompt_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `prompt_tag` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `prompt_id` BIGINT UNSIGNED NOT NULL,
  `tag_id` BIGINT UNSIGNED NOT NULL,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `create_by` BIGINT UNSIGNED NULL COMMENT '创建人 user.id',
  `deleted_by` BIGINT UNSIGNED NULL COMMENT '软删除操作人 user.id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_prompt_tag_unique` (`prompt_id`, `tag_id`),
  KEY `idx_prompt_tag_prompt_id` (`prompt_id`),
  KEY `idx_prompt_tag_tag_id` (`tag_id`),
  KEY `idx_prompt_tag_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `prompt_model` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `prompt_id` BIGINT UNSIGNED NOT NULL,
  `model_id` BIGINT UNSIGNED NOT NULL,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `create_by` BIGINT UNSIGNED NULL COMMENT '创建人 user.id',
  `deleted_by` BIGINT UNSIGNED NULL COMMENT '软删除操作人 user.id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_prompt_model_unique` (`prompt_id`, `model_id`),
  KEY `idx_prompt_model_prompt_id` (`prompt_id`),
  KEY `idx_prompt_model_model_id` (`model_id`),
  KEY `idx_prompt_model_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `prompt_like` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `prompt_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `create_by` BIGINT UNSIGNED NULL COMMENT '创建人 user.id',
  `deleted_by` BIGINT UNSIGNED NULL COMMENT '软删除操作人 user.id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_prompt_like_unique` (`prompt_id`, `user_id`),
  KEY `idx_prompt_like_prompt_id` (`prompt_id`),
  KEY `idx_prompt_like_user_id` (`user_id`),
  KEY `idx_prompt_like_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `favorite` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `prompt_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `create_by` BIGINT UNSIGNED NULL COMMENT '创建人 user.id',
  `deleted_by` BIGINT UNSIGNED NULL COMMENT '软删除操作人 user.id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_favorite_unique` (`prompt_id`, `user_id`),
  KEY `idx_favorite_prompt_id` (`prompt_id`),
  KEY `idx_favorite_user_id` (`user_id`),
  KEY `idx_favorite_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `comment` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `prompt_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `parent_id` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `reply_user_id` BIGINT UNSIGNED NULL,
  `content` TEXT NOT NULL,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `create_by` BIGINT UNSIGNED NULL COMMENT '创建人 user.id',
  `deleted_by` BIGINT UNSIGNED NULL COMMENT '软删除操作人 user.id',
  PRIMARY KEY (`id`),
  KEY `idx_comment_prompt_id` (`prompt_id`),
  KEY `idx_comment_user_id` (`user_id`),
  KEY `idx_comment_parent_id` (`parent_id`),
  KEY `idx_comment_reply_user_id` (`reply_user_id`),
  KEY `idx_comment_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
