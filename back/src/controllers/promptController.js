const { success } = require('../utils/apiResponse');
const promptService = require('../services/promptService');

async function listPrompts(req, res, next) {
  try {
    const data = await promptService.listPrompts(req.query, req.user || null);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function getPromptDetail(req, res, next) {
  try {
    const data = await promptService.getPromptById(Number(req.params.id), req.user || null);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function createPrompt(req, res, next) {
  try {
    const data = await promptService.createPrompt(req.body, req.user);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function updatePrompt(req, res, next) {
  try {
    const data = await promptService.updatePrompt(Number(req.params.id), req.body, req.user);
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

async function toggleLike(req, res, next) {
  try {
    const data = await promptService.togglePromptLike(Number(req.params.id), req.user);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function toggleFavorite(req, res, next) {
  try {
    const data = await promptService.toggleFavorite(Number(req.params.id), req.user);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listPrompts,
  getPromptDetail,
  createPrompt,
  updatePrompt,
  deletePrompt,
  toggleLike,
  toggleFavorite,
};
