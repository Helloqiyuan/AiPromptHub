const createError = require('http-errors');

const {
  sequelize,
  Op,
  User,
  Category,
  Tag,
  AiModel,
  Prompt,
  PromptTag,
  PromptModel,
  PromptLike,
  Favorite,
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

async function resolveTags(input = [], transaction) {
  const tagIds = new Set();

  for (const item of input) {
    if (typeof item === 'number') {
      tagIds.add(item);
      continue;
    }

    if (typeof item === 'string' && item.trim()) {
      const [tag] = await Tag.findOrCreate({
        where: { name: item.trim() },
        defaults: { deleted: false },
        transaction,
      });

      if (tag.deleted) {
        await tag.update({ deleted: false }, { transaction });
      }

      tagIds.add(Number(tag.id));
    }
  }

  return Array.from(tagIds);
}

async function resolveModels(input = [], transaction) {
  const modelIds = new Set();

  for (const item of input) {
    if (typeof item === 'number') {
      modelIds.add(item);
      continue;
    }

    if (typeof item === 'string' && item.trim()) {
      const [model] = await AiModel.findOrCreate({
        where: { name: item.trim() },
        defaults: { deleted: false },
        transaction,
      });

      if (model.deleted) {
        await model.update({ deleted: false }, { transaction });
      }

      modelIds.add(Number(model.id));
    }
  }

  return Array.from(modelIds);
}

async function syncPromptRelations(promptId, { tags = [], modelIds = [], tagIds = [], modelNames = [] }, transaction) {
  const normalizedTagIds = await resolveTags([...tagIds, ...tags], transaction);
  const normalizedModelIds = await resolveModels([...modelIds, ...modelNames], transaction);

  await PromptTag.update(
    { deleted: true },
    {
      where: { promptId },
      transaction,
    },
  );

  await PromptModel.update(
    { deleted: true },
    {
      where: { promptId },
      transaction,
    },
  );

  if (normalizedTagIds.length) {
    await PromptTag.bulkCreate(
      normalizedTagIds.map((tagId) => ({
        promptId,
        tagId,
        deleted: false,
      })),
      {
        updateOnDuplicate: ['deleted', 'update_time'],
        transaction,
      },
    );
  }

  if (normalizedModelIds.length) {
    await PromptModel.bulkCreate(
      normalizedModelIds.map((modelId) => ({
        promptId,
        modelId,
        deleted: false,
      })),
      {
        updateOnDuplicate: ['deleted', 'update_time'],
        transaction,
      },
    );
  }
}

async function refreshPromptCounters(promptId, transaction) {
  const [likeCount, favoriteCount, commentCount] = await Promise.all([
    PromptLike.count({ where: { promptId, deleted: false }, transaction }),
    Favorite.count({ where: { promptId, deleted: false }, transaction }),
    Comment.count({ where: { promptId, deleted: false }, transaction }),
  ]);

  await Prompt.update(
    {
      likeCount,
      favoriteCount,
      commentCount,
    },
    {
      where: { id: promptId },
      transaction,
    },
  );
}

function buildPromptInclude({ tagId, modelId } = {}) {
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
      attributes: ['id', 'name', 'description'],
      where: {
        deleted: false,
      },
      required: false,
    },
    {
      model: Tag,
      as: 'tags',
      attributes: ['id', 'name'],
      through: {
        attributes: [],
        where: {
          deleted: false,
        },
      },
      where: tagId ? { id: Number(tagId), deleted: false } : undefined,
      required: Boolean(tagId),
    },
    {
      model: AiModel,
      as: 'models',
      attributes: ['id', 'name', 'vendor'],
      through: {
        attributes: [],
        where: {
          deleted: false,
        },
      },
      where: modelId ? { id: Number(modelId), deleted: false } : undefined,
      required: Boolean(modelId),
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

  const [likes, favorites] = await Promise.all([
    PromptLike.findAll({
      where: {
        userId: currentUser.id,
        promptId: promptIds,
        deleted: false,
      },
    }),
    Favorite.findAll({
      where: {
        userId: currentUser.id,
        promptId: promptIds,
        deleted: false,
      },
    }),
  ]);

  const likeSet = new Set(likes.map((item) => Number(item.promptId)));
  const favoriteSet = new Set(favorites.map((item) => Number(item.promptId)));

  return prompts.map((item) => ({
    ...item,
    liked: likeSet.has(Number(item.id)),
    favorited: favoriteSet.has(Number(item.id)),
  }));
}

function normalizePromptPayload(prompt) {
  const plain = prompt.get ? prompt.get({ plain: true }) : prompt;

  return {
    ...plain,
    tags: plain.tags || [],
    models: plain.models || [],
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
    include: buildPromptInclude({
      tagId: query.tagId,
      modelId: query.modelId,
    }),
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

    const prompt = await Prompt.create(
      {
        title: payload.title,
        summary: payload.summary || null,
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

    await syncPromptRelations(
      prompt.id,
      {
        tags: payload.tags,
        tagIds: payload.tagIds,
        modelIds: payload.modelIds,
        modelNames: payload.modelNames,
      },
      transaction,
    );

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

    await prompt.update(
      {
        title: payload.title ?? prompt.title,
        summary: payload.summary ?? prompt.summary,
        content: payload.content ?? prompt.content,
        usageScenario: payload.usageScenario ?? prompt.usageScenario,
        exampleInput: payload.exampleInput ?? prompt.exampleInput,
        exampleOutput: payload.exampleOutput ?? prompt.exampleOutput,
        categoryId: payload.categoryId ? Number(payload.categoryId) : prompt.categoryId,
        status: payload.status && isAdmin(currentUser) ? payload.status : prompt.status,
      },
      { transaction },
    );

    if (payload.tags || payload.tagIds || payload.modelIds || payload.modelNames) {
      await syncPromptRelations(
        prompt.id,
        {
          tags: payload.tags,
          tagIds: payload.tagIds,
          modelIds: payload.modelIds,
          modelNames: payload.modelNames,
        },
        transaction,
      );
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

async function togglePromptLike(promptId, currentUser) {
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

    const like = await PromptLike.findOne({
      where: {
        promptId,
        userId: currentUser.id,
      },
      transaction,
    });

    if (!like) {
      await PromptLike.create(
        {
          promptId,
          userId: currentUser.id,
          deleted: false,
        },
        { transaction },
      );
    } else {
      await like.update({ deleted: !like.deleted }, { transaction });
    }

    await refreshPromptCounters(promptId, transaction);
    await prompt.reload({ transaction });

    const active = !like || like.deleted;

    return {
      liked: active,
      likeCount: prompt.likeCount,
    };
  });
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

    if (!favorite) {
      await Favorite.create(
        {
          promptId,
          userId: currentUser.id,
          deleted: false,
        },
        { transaction },
      );
    } else {
      await favorite.update({ deleted: !favorite.deleted }, { transaction });
    }

    await refreshPromptCounters(promptId, transaction);
    await prompt.reload({ transaction });

    const active = !favorite || favorite.deleted;

    return {
      favorited: active,
      favoriteCount: prompt.favoriteCount,
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
  const [promptCount, commentCount, favoriteCount, likeCount] = await Promise.all([
    Prompt.count({ where: { deleted: false } }),
    Comment.count({ where: { deleted: false } }),
    Favorite.count({ where: { deleted: false } }),
    PromptLike.count({ where: { deleted: false } }),
  ]);

  return {
    promptCount,
    commentCount,
    favoriteCount,
    likeCount,
  };
}

module.exports = {
  listPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
  togglePromptLike,
  toggleFavorite,
  listFavoritePrompts,
  reviewPrompt,
  listAdminPrompts,
  getPromptStats,
  canManagePrompt,
  refreshPromptCounters,
};

