const { Category, Tag, AiModel } = require('../models');

async function listCategories() {
  const categories = await Category.findAll({
    where: {
      deleted: false,
    },
    order: [
      ['sort', 'ASC'],
      ['id', 'ASC'],
    ],
  });

  return categories.map((item) => item.get({ plain: true }));
}

async function listTags() {
  const tags = await Tag.findAll({
    where: {
      deleted: false,
    },
    order: [['name', 'ASC']],
  });

  return tags.map((item) => item.get({ plain: true }));
}

async function listModels() {
  const models = await AiModel.findAll({
    where: {
      deleted: false,
    },
    order: [['name', 'ASC']],
  });

  return models.map((item) => item.get({ plain: true }));
}

async function createCategory(payload) {
  const category = await Category.create({
    name: payload.name,
    description: payload.description || null,
    parentId: payload.parentId !== undefined && payload.parentId !== null ? Number(payload.parentId) : -1,
    sort: payload.sort || 0,
  });

  return category;
}

module.exports = {
  listCategories,
  listTags,
  listModels,
  createCategory,
};
