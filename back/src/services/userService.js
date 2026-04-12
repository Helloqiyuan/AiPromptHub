const createError = require('http-errors');

const { Op, User, Prompt, Comment } = require('../models');
const { ensureUniqueUserFields } = require('./authService');
const { buildPaginationResult, normalizePagination } = require('../utils/pagination');
const { listFavoritePrompts, listPrompts } = require('./promptService');

async function getProfile(currentUser) {
  const [promptCount, favoriteCount, commentCount] = await Promise.all([
    Prompt.count({
      where: {
        userId: currentUser.id,
        deleted: false,
      },
    }),
    currentUser.countFavorites({
      where: {
        deleted: false,
      },
    }),
    Comment.count({
      where: {
        userId: currentUser.id,
        deleted: false,
      },
    }),
  ]);

  return {
    ...currentUser.get({ plain: true }),
    stats: {
      promptCount,
      favoriteCount,
      commentCount,
    },
  };
}

async function updateProfile(currentUser, payload) {
  const nextPayload = {
    username: payload.username ?? currentUser.username,
    email: payload.email !== undefined ? payload.email || null : currentUser.email,
    phone: payload.phone !== undefined ? payload.phone || null : currentUser.phone,
  };

  await ensureUniqueUserFields(nextPayload, currentUser.id);

  await currentUser.update({
    username: nextPayload.username,
    email: nextPayload.email,
    phone: nextPayload.phone,
    avatar: payload.avatar ?? currentUser.avatar,
    bio: payload.bio ?? currentUser.bio,
  });

  return currentUser.reload();
}

async function getMyPrompts(currentUser, query) {
  return listPrompts(
    {
      ...query,
      mine: true,
      userId: currentUser.id,
    },
    currentUser,
  );
}

async function getMyFavorites(currentUser, query) {
  return listFavoritePrompts(currentUser.id, query, currentUser);
}

async function getMyComments(currentUser, query) {
  const { page, pageSize, limit, offset } = normalizePagination(query);

  const result = await Comment.findAndCountAll({
    where: {
      userId: currentUser.id,
      deleted: false,
    },
    include: [
      {
        model: Prompt,
        as: 'prompt',
        attributes: ['id', 'title', 'status'],
        required: false,
      },
    ],
    order: [['createTime', 'DESC']],
    limit,
    offset,
  });

  return buildPaginationResult(
    {
      count: result.count,
      rows: result.rows.map((item) => item.get({ plain: true })),
    },
    page,
    pageSize,
  );
}

async function listUsers(query) {
  const { page, pageSize, limit, offset } = normalizePagination(query);
  const where = {
    deleted: false,
  };

  if (query.keyword) {
    where[Op.or] = [
      { username: { [Op.like]: `%${query.keyword}%` } },
      { email: { [Op.like]: `%${query.keyword}%` } },
      { phone: { [Op.like]: `%${query.keyword}%` } },
    ];
  }

  if (query.role) {
    where.role = query.role;
  }

  if (query.status) {
    where.status = query.status;
  }

  const result = await User.findAndCountAll({
    where,
    order: [['createTime', 'DESC']],
    limit,
    offset,
  });

  return buildPaginationResult(
    {
      count: result.count,
      rows: result.rows.map((item) => item.get({ plain: true })),
    },
    page,
    pageSize,
  );
}

async function updateUserRole(userId, role, actor) {
  const user = await User.findOne({
    where: {
      id: userId,
      deleted: false,
    },
  });

  if (!user) {
    throw createError(404, '用户不存在');
  }

  if (Number(user.id) === Number(actor.id) && role !== actor.role) {
    throw createError(400, '不能修改自己的角色');
  }

  await user.update({ role });
  return user;
}

async function updateUserStatus(userId, status, actor) {
  const user = await User.findOne({
    where: {
      id: userId,
      deleted: false,
    },
  });

  if (!user) {
    throw createError(404, '用户不存在');
  }

  if (Number(user.id) === Number(actor.id) && status !== actor.status) {
    throw createError(400, '不能修改自己的状态');
  }

  await user.update({ status });
  return user;
}

module.exports = {
  getProfile,
  updateProfile,
  getMyPrompts,
  getMyFavorites,
  getMyComments,
  listUsers,
  updateUserRole,
  updateUserStatus,
};
