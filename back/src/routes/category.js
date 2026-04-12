const express = require('express');
const { body } = require('express-validator');

const controller = require('../controllers/catalogController');
const validateRequest = require('../middlewares/validateRequest');
const { authenticate, authorizeAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/categories', controller.listCategories);
router.get('/tags', controller.listTags);
router.get('/models', controller.listModels);

router.post(
  '/categories',
  authenticate,
  authorizeAdmin,
  [
    body('name').trim().notEmpty().withMessage('分类名称不能为空'),
    body('description').optional({ nullable: true }).isLength({ max: 255 }).withMessage('描述长度不能超过255'),
    body('parentId').optional().isInt({ min: -1 }).withMessage('父级分类 ID 不合法'),
    body('sort').optional().isInt({ min: 0 }).withMessage('排序值不能小于0'),
    validateRequest,
  ],
  controller.createCategory,
);

module.exports = router;
