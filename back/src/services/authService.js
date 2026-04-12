const createError = require('http-errors');

const { Op, User } = require('../models');
const { USER_STATUS } = require('../config/constants');
const { comparePassword, hashPassword } = require('../utils/password');
const { signToken } = require('../utils/token');

async function ensureUniqueUserFields({ username, email, phone }, excludeUserId) {
  const conditions = [];

  if (username) {
    conditions.push({ username });
  }

  if (email) {
    conditions.push({ email });
  }

  if (phone) {
    conditions.push({ phone });
  }

  if (!conditions.length) {
    return;
  }

  const existingUser = await User.unscoped().findOne({
    where: {
      deleted: false,
      [Op.and]: [
        excludeUserId ? { id: { [Op.ne]: excludeUserId } } : {},
        { [Op.or]: conditions },
      ],
    },
  });

  if (!existingUser) {
    return;
  }

  if (existingUser.username === username) {
    throw createError(409, '用户名已存在');
  }

  if (email && existingUser.email === email) {
    throw createError(409, '邮箱已存在');
  }

  if (phone && existingUser.phone === phone) {
    throw createError(409, '手机号已存在');
  }
}

async function register(payload) {
  const { username, email = null, phone = null, password } = payload;

  await ensureUniqueUserFields({ username, email, phone });

  const user = await User.unscoped().create({
    username,
    email,
    phone,
    password: await hashPassword(password),
  });

  return {
    userId: user.id,
  };
}

async function login(payload) {
  const account = payload.account || payload.username;

  const user = await User.unscoped().findOne({
    where: {
      deleted: false,
      [Op.or]: [{ username: account }, { email: account }, { phone: account }],
    },
  });

  if (!user) {
    throw createError(401, '用户名或密码错误');
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw createError(403, '当前账号已被禁用');
  }

  const isPasswordValid = await comparePassword(payload.password, user.password);

  if (!isPasswordValid) {
    throw createError(401, '用户名或密码错误');
  }

  const plainUser = user.get({ plain: true });
  delete plainUser.password;

  return {
    token: signToken(user),
    user: plainUser,
  };
}

module.exports = {
  register,
  login,
  ensureUniqueUserFields,
};


