const express = require('express');
const { body, param, query } = require('express-validator');

const controller = require('../controllers/promptController');
const validateRequest = require('../middlewares/validateRequest');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page必须为正整数'),
    query('pageSize').optional().isInt({ min: 1, max: 50 }).withMessage('pageSize必须在1-50之间'),
    query('tagId').optional().isInt({ min: 1 }).withMessage('标签ID不合法'),
    validateRequest,
  ],
  controller.listPrompts,
);

router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('Prompt ID不合法'), validateRequest],
  controller.getPromptDetail,
);

router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('标题不能为空').isLength({ max: 150 }).withMessage('标题长度不能超过150'),
    body('content').trim().notEmpty().withMessage('内容不能为空'),
    body('summary').optional({ nullable: true }).isLength({ max: 255 }).withMessage('摘要长度不能超过255'),
    body('usageScenario').optional({ nullable: true }).isLength({ max: 255 }).withMessage('使用场景长度不能超过255'),
    body('categoryId').optional().isInt({ min: 1 }).withMessage('分类ID不合法'),
    body('tagIds').optional().isArray().withMessage('tagIds须为数组'),
    body('tagIds.*').optional().isInt({ min: 1 }).withMessage('标签ID不合法'),
    body('tagId')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        const n = Number(value);
        return Number.isInteger(n) && n >= 1;
      })
      .withMessage('标签ID不合法'),
    validateRequest,
  ],
  controller.createPrompt,
);

router.put(
  '/:id',
  authenticate,
  [
    param('id').isInt({ min: 1 }).withMessage('Prompt ID不合法'),
    body('title').optional().trim().isLength({ min: 1, max: 150 }).withMessage('标题长度需在1-150之间'),
    body('categoryId').optional().isInt({ min: 1 }).withMessage('分类ID不合法'),
    body('tagIds').optional().isArray().withMessage('tagIds须为数组'),
    body('tagIds.*').optional().isInt({ min: 1 }).withMessage('标签ID不合法'),
    body('tagId')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        const n = Number(value);
        return Number.isInteger(n) && n >= 1;
      })
      .withMessage('标签ID不合法'),
    validateRequest,
  ],
  controller.updatePrompt,
);

router.delete(
  '/:id',
  authenticate,
  [param('id').isInt({ min: 1 }).withMessage('Prompt ID不合法'), validateRequest],
  controller.deletePrompt,
);

router.post(
  '/:id/favorites/toggle',
  authenticate,
  [param('id').isInt({ min: 1 }).withMessage('Prompt ID不合法'), validateRequest],
  controller.toggleFavorite,
);

module.exports = router;
