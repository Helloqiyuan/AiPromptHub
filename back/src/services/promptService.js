const createError = require('http-errors');

const {
  sequelize,
  Op,
  User,
  Category,
  Tag,
  Prompt,
  Favorite,
  PromptLike,
  Comment,
} = require('../models');
const { PROMPT_STATUS, USER_ROLES } = require('../config/constants');
const { buildPaginationResult, normalizePagination } = require('../utils/pagination');

function isAdmin(user) {
  return [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user?.role);
}

function canManagePrompt(user, prompt) {
  return isAdmin(user) || Number(user?.id) === Number(prompt.userId);
}

async function ensureDefaultCategory(transaction) {
  const [category] = await Category.findOrCreate({
    where: { name: '文本生成' },
    defaults: {
      description: '对话、摘要、翻译、写作等文本类 AIGC',
      parentId: 1,
      sort: 10,
      deleted: false,
    },
    transaction,
  });

  if (category.deleted) {
    await category.update({ deleted: false }, { transaction });
  }

  return category.id;
}

/**
 * 从 body 解析标签 id 列表：支持 tagIds 数组或兼容单字段 tagId；全部须为未删除的 tag
 */
async function resolveTagIds(payload, transaction) {
  let raw = [];
  if (Array.isArray(payload.tagIds)) {
    raw = payload.tagIds;
  } else if (
    Object.prototype.hasOwnProperty.call(payload, 'tagId') &&
    payload.tagId !== undefined &&
    payload.tagId !== null &&
    payload.tagId !== ''
  ) {
    raw = [payload.tagId];
  }
  if (!raw.length) {
    return [];
  }
  const ids = [...new Set(raw.map((v) => Number(v)))];
  if (ids.some((n) => !Number.isInteger(n) || n < 1)) {
    throw createError(400, '标签ID不合法');
  }
  const tags = await Tag.findAll({
    where: { id: ids, deleted: false },
    transaction,
  });
  if (tags.length !== ids.length) {
    throw createError(400, '标签不存在或已删除');
  }
  return ids;
}

async function refreshPromptCounters(promptId, transaction) {
  const [favoriteCount, commentCount, likeCount] = await Promise.all([
    Favorite.count({ where: { promptId, deleted: false }, transaction }),
    Comment.count({ where: { promptId, deleted: false }, transaction }),
    PromptLike.count({ where: { promptId, deleted: false }, transaction }),
  ]);

  await Prompt.update(
    { favoriteCount, commentCount, likeCount },
    { where: { id: promptId }, transaction },
  );
}

/** 列表/详情关联查询；filterTagId 有值时仅返回包含该标签的 Prompt（INNER JOIN 标签） */
function buildPromptInclude(options = {}) {
  const filterTagId = options.filterTagId ? Number(options.filterTagId) : null;
  return [
    {
      model: User,
      as: 'author',
      attributes: ['id', 'username', 'avatar', 'role'],
      where: {
        deleted: false,
      },
      required: true,
    },
    {
      model: Category,
      as: 'category',
      attributes: ['id', 'name', 'description', 'parentId', 'sort'],
      where: {
        deleted: false,
      },
      required: false,
    },
    {
      model: Tag,
      as: 'tags',
      attributes: ['id', 'name', 'deleted'],
      through: { attributes: [] },
      required: Boolean(filterTagId),
      ...(filterTagId
        ? { where: { id: filterTagId, deleted: false } }
        : {}),
    },
  ];
}

async function attachUserStates(prompts, currentUser) {
  if (!currentUser || !prompts.length) {
    return prompts.map((item) => ({
      ...item,
      liked: false,
      favorited: false,
    }));
  }

  const promptIds = prompts.map((item) => item.id);

  const [favorites, likes] = await Promise.all([
    Favorite.findAll({
      where: {
        userId: currentUser.id,
        promptId: promptIds,
        deleted: false,
      },
    }),
    PromptLike.findAll({
      where: {
        userId: currentUser.id,
        promptId: promptIds,
        deleted: false,
      },
    }),
  ]);

  const favoriteSet = new Set(favorites.map((item) => Number(item.promptId)));
  const likeSet = new Set(likes.map((item) => Number(item.promptId)));

  return prompts.map((item) => ({
    ...item,
    liked: likeSet.has(Number(item.id)),
    favorited: favoriteSet.has(Number(item.id)),
  }));
}

function normalizePromptPayload(prompt) {
  const plain = prompt.get ? prompt.get({ plain: true }) : prompt;
  const { tags: tagRows, ...rest } = plain;
  const tags = Array.isArray(tagRows)
    ? tagRows
        .filter((t) => t && !t.deleted)
        .map((t) => ({ id: t.id, name: t.name }))
    : [];
  const tagLite = tags[0] ?? null;

  return {
    ...rest,
    tag: tagLite,
    tags,
    models: [],
  };
}

async function getPromptById(promptId, currentUser, options = {}) {
  const prompt = await Prompt.findOne({
    where: {
      id: promptId,
      deleted: false,
    },
    include: buildPromptInclude(),
    transaction: options.transaction,
  });

  if (!prompt) {
    throw createError(404, 'Prompt不存在');
  }

  const plain = normalizePromptPayload(prompt);
  const isVisible =
    plain.status === PROMPT_STATUS.PUBLISHED ||
    canManagePrompt(currentUser, plain) ||
    (options.allowAdminDraft && isAdmin(currentUser));

  if (!isVisible) {
    throw createError(403, '当前Prompt不可访问');
  }

  const [withUserState] = await attachUserStates([plain], currentUser);
  return withUserState;
}

async function listPrompts(query, currentUser) {
  const { page, pageSize, limit, offset } = normalizePagination(query);
  const where = {
    deleted: false,
  };

  if (query.keyword) {
    where[Op.or] = [
      { title: { [Op.like]: `%${query.keyword}%` } },
      { content: { [Op.like]: `%${query.keyword}%` } },
      { summary: { [Op.like]: `%${query.keyword}%` } },
    ];
  }

  if (query.categoryId) {
    where.categoryId = Number(query.categoryId);
  } else if (query.parentCategoryId) {
    const children = await Category.findAll({
      where: {
        parentId: Number(query.parentCategoryId),
        deleted: false,
      },
      attributes: ['id'],
    });
    const ids = children.map((c) => c.id);
    where.categoryId =
      ids.length > 0 ? { [Op.in]: ids } : { [Op.in]: [-1] };
  }

  if (query.userId) {
    where.userId = Number(query.userId);
  }

  if (query.status && isAdmin(currentUser)) {
    where.status = query.status;
  } else if (query.mine && currentUser) {
    where.userId = currentUser.id;
  } else {
    where.status = PROMPT_STATUS.PUBLISHED;
  }

  const result = await Prompt.findAndCountAll({
    where,
    include: buildPromptInclude({ filterTagId: query.tagId }),
    order: [['createTime', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  const rows = await attachUserStates(result.rows.map(normalizePromptPayload), currentUser);
  return buildPaginationResult({ count: result.count, rows }, page, pageSize);
}

async function createPrompt(payload, currentUser) {
  return sequelize.transaction(async (transaction) => {
    const categoryId = payload.categoryId
      ? Number(payload.categoryId)
      : await ensureDefaultCategory(transaction);

    const tagIds = await resolveTagIds(payload, transaction);

    const prompt = await Prompt.create(
      {
        title: payload.title,
        summary: payload.summary || null,
        image: payload.image || null,
        content: payload.content,
        usageScenario: payload.usageScenario || null,
        exampleInput: payload.exampleInput || null,
        exampleOutput: payload.exampleOutput || null,
        userId: currentUser.id,
        categoryId,
        status: payload.status || PROMPT_STATUS.PUBLISHED,
      },
      { transaction },
    );

    if (tagIds.length) {
      await prompt.setTags(tagIds, { transaction });
    }

    return getPromptById(prompt.id, currentUser, { transaction, allowAdminDraft: true });
  });
}

async function updatePrompt(promptId, payload, currentUser) {
  return sequelize.transaction(async (transaction) => {
    const prompt = await Prompt.findOne({
      where: {
        id: promptId,
        deleted: false,
      },
      transaction,
    });

    if (!prompt) {
      throw createError(404, 'Prompt不存在');
    }

    if (!canManagePrompt(currentUser, prompt)) {
      throw createError(403, '没有修改该Prompt的权限');
    }

    const shouldSyncTags =
      Object.prototype.hasOwnProperty.call(payload, 'tagIds') ||
      Object.prototype.hasOwnProperty.call(payload, 'tagId');

    await prompt.update(
      {
        title: payload.title ?? prompt.title,
        summary: payload.summary ?? prompt.summary,
        image:
          Object.prototype.hasOwnProperty.call(payload, 'image')
            ? payload.image || null
            : prompt.image,
        content: payload.content ?? prompt.content,
        usageScenario: payload.usageScenario ?? prompt.usageScenario,
        exampleInput: payload.exampleInput ?? prompt.exampleInput,
        exampleOutput: payload.exampleOutput ?? prompt.exampleOutput,
        categoryId: payload.categoryId ? Number(payload.categoryId) : prompt.categoryId,
        status: payload.status && isAdmin(currentUser) ? payload.status : prompt.status,
      },
      { transaction },
    );

    if (shouldSyncTags) {
      const nextIds = await resolveTagIds(payload, transaction);
      await prompt.setTags(nextIds, { transaction });
    }

    return getPromptById(prompt.id, currentUser, { transaction, allowAdminDraft: true });
  });
}

async function deletePrompt(promptId, currentUser) {
  const prompt = await Prompt.findOne({
    where: {
      id: promptId,
      deleted: false,
    },
  });

  if (!prompt) {
    throw createError(404, 'Prompt不存在');
  }

  if (!canManagePrompt(currentUser, prompt)) {
    throw createError(403, '没有删除该Prompt的权限');
  }

  await prompt.update({ deleted: true });
  return { id: promptId };
}

async function toggleFavorite(promptId, currentUser) {
  return sequelize.transaction(async (transaction) => {
    const prompt = await Prompt.findOne({
      where: {
        id: promptId,
        deleted: false,
        status: PROMPT_STATUS.PUBLISHED,
      },
      transaction,
    });

    if (!prompt) {
      throw createError(404, 'Prompt不存在');
    }

    const favorite = await Favorite.findOne({
      where: {
        promptId,
        userId: currentUser.id,
      },
      transaction,
    });

    let favorited;
    if (!favorite) {
      await Favorite.create(
        {
          promptId,
          userId: currentUser.id,
          deleted: false,
        },
        { transaction },
      );
      favorited = true;
    } else {
      await favorite.update({ deleted: !favorite.deleted }, { transaction });
      await favorite.reload({ transaction });
      favorited = !favorite.deleted;
    }

    await refreshPromptCounters(promptId, transaction);
    await prompt.reload({ transaction });

    return {
      favorited,
      favoriteCount: prompt.favoriteCount,
    };
  });
}

/** 切换点赞：无记录则插入，有记录则软删切换，并刷新 prompt.like_count */
async function toggleLike(promptId, currentUser) {
  return sequelize.transaction(async (transaction) => {
    const prompt = await Prompt.findOne({
      where: {
        id: promptId,
        deleted: false,
        status: PROMPT_STATUS.PUBLISHED,
      },
      transaction,
    });

    if (!prompt) {
      throw createError(404, 'Prompt不存在');
    }

    const row = await PromptLike.findOne({
      where: {
        promptId,
        userId: currentUser.id,
      },
      transaction,
    });

    let liked;
    if (!row) {
      await PromptLike.create(
        {
          promptId,
          userId: currentUser.id,
          deleted: false,
        },
        { transaction },
      );
      liked = true;
    } else {
      await row.update({ deleted: !row.deleted }, { transaction });
      await row.reload({ transaction });
      liked = !row.deleted;
    }

    await refreshPromptCounters(promptId, transaction);
    await prompt.reload({ transaction });

    return {
      liked,
      likeCount: prompt.likeCount,
    };
  });
}

async function listFavoritePrompts(userId, query, currentUser) {
  const { page, pageSize, limit, offset } = normalizePagination(query);

  const result = await Favorite.findAndCountAll({
    where: {
      userId,
      deleted: false,
    },
    include: [
      {
        model: Prompt,
        as: 'prompt',
        where: {
          deleted: false,
          status: PROMPT_STATUS.PUBLISHED,
        },
        include: buildPromptInclude(),
      },
    ],
    order: [['createTime', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  const prompts = result.rows.map((item) => normalizePromptPayload(item.prompt));
  const rows = await attachUserStates(prompts, currentUser);

  return buildPaginationResult(
    {
      count: result.count,
      rows,
    },
    page,
    pageSize,
  );
}

async function reviewPrompt(promptId, status) {
  const prompt = await Prompt.findOne({
    where: {
      id: promptId,
      deleted: false,
    },
  });

  if (!prompt) {
    throw createError(404, 'Prompt不存在');
  }

  await prompt.update({ status });
  return getPromptById(promptId, { role: USER_ROLES.ADMIN }, { allowAdminDraft: true });
}

async function listAdminPrompts(query) {
  return listPrompts(query, { role: USER_ROLES.ADMIN });
}

async function getPromptStats() {
  const [promptCount, commentCount, favoriteCount, likeSum] = await Promise.all([
    Prompt.count({ where: { deleted: false } }),
    Comment.count({ where: { deleted: false } }),
    Favorite.count({ where: { deleted: false } }),
    Prompt.sum('likeCount', { where: { deleted: false } }),
  ]);

  return {
    promptCount,
    commentCount,
    favoriteCount,
    likeCount: Number(likeSum) || 0,
  };
}

module.exports = {
  listPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
  toggleFavorite,
  toggleLike,
  listFavoritePrompts,
  reviewPrompt,
  listAdminPrompts,
  getPromptStats,
  canManagePrompt,
  refreshPromptCounters,
};
