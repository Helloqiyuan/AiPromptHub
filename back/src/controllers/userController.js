const { success } = require('../utils/apiResponse');
const authService = require('../services/authService');
const userService = require('../services/userService');

async function register(req, res, next) {
  try {
    const data = await authService.register(req.body);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const data = await authService.login(req.body);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const data = await userService.getProfile(req.user);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function updateMe(req, res, next) {
  try {
    const data = await userService.updateProfile(req.user, req.body);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function getMyPrompts(req, res, next) {
  try {
    const data = await userService.getMyPrompts(req.user, req.query);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function getMyFavorites(req, res, next) {
  try {
    const data = await userService.getMyFavorites(req.user, req.query);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function getMyComments(req, res, next) {
  try {
    const data = await userService.getMyComments(req.user, req.query);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  getMyPrompts,
  getMyFavorites,
  getMyComments,
};
