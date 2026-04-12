const { success } = require('../utils/apiResponse');
const adminService = require('../services/adminService');
const promptService = require('../services/promptService');

async function getStats(req, res, next) {
  try {
    const data = await adminService.getDashboardStats();
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function listPrompts(req, res, next) {
  try {
    const data = await adminService.listAdminPrompts(req.query);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function reviewPrompt(req, res, next) {
  try {
    const data = await adminService.reviewPrompt(Number(req.params.id), req.body.status);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function deletePrompt(req, res, next) {
  try {
    const data = await promptService.deletePrompt(Number(req.params.id), req.user);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function listUsers(req, res, next) {
  try {
    const data = await adminService.listUsers(req.query);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const data = await adminService.updateUserRole(Number(req.params.id), req.body.role, req.user);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const data = await adminService.updateUserStatus(Number(req.params.id), req.body.status, req.user);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStats,
  listPrompts,
  reviewPrompt,
  deletePrompt,
  listUsers,
  updateUserRole,
  updateUserStatus,
};
