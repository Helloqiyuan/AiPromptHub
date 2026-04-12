const express = require('express');
const { body, param, query } = require('express-validator');

const controller = require('../controllers/commentController');
const validateRequest = require('../middlewares/validateRequest');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.post(
  '/',
  authenticate,
  [
    body('promptId').isInt({ min: 1 }).withMessage('promptId不合法'),
    body('content').trim().notEmpty().withMessage('评论内容不能为空'),
    body('parentId').optional().isInt({ min: 1 }).withMessage('parentId不合法'),
    validateRequest,
  ],
  controller.createComment,
);

router.get(
  '/tree',
  [query('promptId').isInt({ min: 1 }).withMessage('promptId不合法'), validateRequest],
  controller.getCommentTree,
);

router.delete(
  '/:id',
  authenticate,
  [param('id').isInt({ min: 1 }).withMessage('评论ID不合法'), validateRequest],
  controller.deleteComment,
);

module.exports = router;
