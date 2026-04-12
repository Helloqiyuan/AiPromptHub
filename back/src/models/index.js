const { DataTypes, Op } = require('sequelize');

const sequelize = require('../config/database');
const { PROMPT_STATUS, USER_ROLES, USER_STATUS } = require('../config/constants');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    bio: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: USER_ROLES.USER,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: USER_STATUS.ACTIVE,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    deletedBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
  },
  {
    tableName: 'user',
    defaultScope: {
      attributes: {
        exclude: ['password'],
      },
    },
    scopes: {
      withPassword: {},
    },
    indexes: [
      { unique: true, fields: ['username'] },
      { unique: true, fields: ['email'] },
      { unique: true, fields: ['phone'] },
      { fields: ['role'] },
      { fields: ['status'] },
      { fields: ['deleted'] },
    ],
  },
);

const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    parentId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: -1,
    },
    sort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    deletedBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
  },
  {
    tableName: 'category',
    indexes: [
      { unique: true, fields: ['name'] },
      { fields: ['deleted', 'sort'] },
      { fields: ['parent_id'] },
    ],
  },
);

const Tag = sequelize.define(
  'Tag',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    deletedBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
  },
  {
    tableName: 'tag',
    indexes: [{ unique: true, fields: ['name'] }, { fields: ['deleted'] }],
  },
);

const Prompt = sequelize.define(
  'Prompt',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    summary: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    usageScenario: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    exampleInput: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    exampleOutput: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    likeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    favoriteCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    commentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: PROMPT_STATUS.PUBLISHED,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    deletedBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
  },
  {
    tableName: 'prompt',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['category_id'] },
      { fields: ['status'] },
      { fields: ['deleted'] },
      { fields: ['create_time'] },
    ],
  },
);

/** 中间表：prompt 与 tag 多对多（表名 prompt_tag，复合主键） */
const PromptTag = sequelize.define(
  'PromptTag',
  {
    promptId: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
    },
    tagId: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
    },
  },
  {
    tableName: 'prompt_tag',
    timestamps: false,
  },
);

const Favorite = sequelize.define(
  'Favorite',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    promptId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    deletedBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
  },
  {
    tableName: 'favorite',
    indexes: [
      { unique: true, fields: ['prompt_id', 'user_id'] },
      { fields: ['prompt_id'] },
      { fields: ['user_id'] },
      { fields: ['deleted'] },
    ],
  },
);

const Comment = sequelize.define(
  'Comment',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    promptId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    replyUserId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    deletedBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
  },
  {
    tableName: 'comment',
    indexes: [
      { fields: ['prompt_id'] },
      { fields: ['user_id'] },
      { fields: ['parent_id'] },
      { fields: ['reply_user_id'] },
      { fields: ['deleted'] },
    ],
  },
);

User.hasMany(Prompt, { foreignKey: 'userId', as: 'prompts', constraints: false });
Prompt.belongsTo(User, { foreignKey: 'userId', as: 'author', constraints: false });

Category.hasMany(Prompt, { foreignKey: 'categoryId', as: 'prompts', constraints: false });
Prompt.belongsTo(Category, { foreignKey: 'categoryId', as: 'category', constraints: false });

Prompt.belongsToMany(Tag, {
  through: PromptTag,
  foreignKey: 'promptId',
  otherKey: 'tagId',
  as: 'tags',
  constraints: false,
});
Tag.belongsToMany(Prompt, {
  through: PromptTag,
  foreignKey: 'tagId',
  otherKey: 'promptId',
  as: 'prompts',
  constraints: false,
});

Prompt.hasMany(Favorite, { foreignKey: 'promptId', as: 'favorites', constraints: false });
Favorite.belongsTo(Prompt, { foreignKey: 'promptId', as: 'prompt', constraints: false });
User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites', constraints: false });
Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user', constraints: false });

Prompt.hasMany(Comment, { foreignKey: 'promptId', as: 'comments', constraints: false });
Comment.belongsTo(Prompt, { foreignKey: 'promptId', as: 'prompt', constraints: false });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments', constraints: false });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author', constraints: false });
Comment.belongsTo(User, { foreignKey: 'replyUserId', as: 'replyUser', constraints: false });

module.exports = {
  sequelize,
  Op,
  User,
  Category,
  Tag,
  Prompt,
  PromptTag,
  Favorite,
  Comment,
};
