const { success } = require('../utils/apiResponse');
const catalogService = require('../services/catalogService');

async function listCategories(req, res, next) {
  try {
    const data = await catalogService.listCategories();
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function listTags(req, res, next) {
  try {
    const data = await catalogService.listTags();
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function listModels(req, res, next) {
  try {
    const data = await catalogService.listModels();
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const data = await catalogService.createCategory(req.body);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listCategories,
  listTags,
  listModels,
  createCategory,
};
