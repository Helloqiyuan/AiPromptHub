const express = require('express');
const { body, param } = require('express-validator');

const controller = require('../controllers/adminController');
const validateRequest = require('../middlewares/validateRequest');
const { authenticate, authorizeAdmin, authorizeSuperAdmin } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/stats', authorizeAdmin, controller.getStats);
router.get('/prompts', authorizeAdmin, controller.listPrompts);
router.patch(
  '/prompts/:id/status',
  authorizeAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('Prompt ID不合法'),
    body('status').isIn(['published', 'pending', 'rejected', 'archived']).withMessage('状态值不合法'),
    validateRequest,
  ],
  controller.reviewPrompt,
);
router.delete(
  '/prompts/:id',
  authorizeAdmin,
  [param('id').isInt({ min: 1 }).withMessage('Prompt ID不合法'), validateRequest],
  controller.deletePrompt,
);

router.get('/users', authorizeAdmin, controller.listUsers);
router.patch(
  '/users/:id/role',
  authorizeSuperAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('用户ID不合法'),
    body('role').isIn(['user', 'admin', 'super_admin']).withMessage('角色值不合法'),
    validateRequest,
  ],
  controller.updateUserRole,
);
router.patch(
  '/users/:id/status',
  authorizeAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('用户ID不合法'),
    body('status').isIn(['active', 'disabled']).withMessage('状态值不合法'),
    validateRequest,
  ],
  controller.updateUserStatus,
);

module.exports = router;
