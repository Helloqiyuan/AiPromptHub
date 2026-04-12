const express = require('express');

const userRoutes = require('./user');
const promptRoutes = require('./prompt');
const commentRoutes = require('./comment');
const categoryRoutes = require('./category');
const adminRoutes = require('./admin');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/prompts', promptRoutes);
router.use('/comments', commentRoutes);
router.use('/catalog', categoryRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
