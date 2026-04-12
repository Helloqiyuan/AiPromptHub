const express = require('express');
const { body } = require('express-validator');

const controller = require('../controllers/userController');
const validateRequest = require('../middlewares/validateRequest');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('username').trim().notEmpty().withMessage('用户名不能为空').isLength({ min: 2, max: 50 }).withMessage('用户名长度需在2-50之间'),
    body('password').isLength({ min: 6, max: 32 }).withMessage('密码长度需在6-32之间'),
    body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('邮箱格式不正确'),
    body('phone').optional({ nullable: true, checkFalsy: true }).isLength({ min: 6, max: 20 }).withMessage('手机号格式不正确'),
    validateRequest,
  ],
  controller.register,
);

router.post(
  '/login',
  [
    body('username').optional({ nullable: true, checkFalsy: true }).isString(),
    body('account').optional({ nullable: true, checkFalsy: true }).isString(),
    body('password').notEmpty().withMessage('密码不能为空'),
    body().custom((value) => {
      if (!value.username && !value.account) {
        throw new Error('username 或 account 至少填写一个');
      }
      return true;
    }),
    validateRequest,
  ],
  controller.login,
);

router.get('/me', authenticate, controller.getMe);
router.put(
  '/me',
  authenticate,
  [
    body('username').optional().trim().isLength({ min: 2, max: 50 }).withMessage('用户名长度需在2-50之间'),
    body('email').optional({ nullable: true }).custom((value) => !value || /\S+@\S+\.\S+/.test(value)).withMessage('邮箱格式不正确'),
    body('phone').optional({ nullable: true }).isLength({ min: 6, max: 20 }).withMessage('手机号格式不正确'),
    body('avatar').optional({ nullable: true }).isLength({ max: 255 }).withMessage('头像地址过长'),
    body('bio').optional({ nullable: true }).isLength({ max: 255 }).withMessage('简介长度不能超过255'),
    validateRequest,
  ],
  controller.updateMe,
);
router.get('/me/prompts', authenticate, controller.getMyPrompts);
router.get('/me/favorites', authenticate, controller.getMyFavorites);
router.get('/me/comments', authenticate, controller.getMyComments);

module.exports = router;
