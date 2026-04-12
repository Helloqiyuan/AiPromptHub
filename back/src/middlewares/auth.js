const createError = require('http-errors');
const jwt = require('jsonwebtoken');

const env = require('../config/env');
const { User } = require('../models');
const { USER_ROLES, USER_STATUS } = require('../config/constants');

async function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw createError(401, '未提供有效的认证令牌');
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findOne({
      where: {
        id: payload.userId,
        deleted: false,
      },
    });

    if (!user) {
      throw createError(401, '用户不存在或已失效');
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      throw createError(403, '当前账号已被禁用');
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(createError(401, '登录状态已失效，请重新登录'));
    }

    return next(error);
  }
}

function authorize(roles = []) {
  const roleList = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return next(createError(401, '请先登录'));
    }

    if (!roleList.length) {
      return next();
    }

    if (!roleList.includes(req.user.role)) {
      return next(createError(403, '没有操作权限'));
    }

    return next();
  };
}

function authorizeAdmin(req, res, next) {
  return authorize([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN])(req, res, next);
}

function authorizeSuperAdmin(req, res, next) {
  return authorize(USER_ROLES.SUPER_ADMIN)(req, res, next);
}

module.exports = {
  authenticate,
  authorize,
  authorizeAdmin,
  authorizeSuperAdmin,
};

