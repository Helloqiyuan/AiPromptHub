const { User, Category } = require('../models');
const { getPromptStats, listAdminPrompts, reviewPrompt } = require('./promptService');
const { listUsers, updateUserRole, updateUserStatus } = require('./userService');

async function getDashboardStats() {
  const [userCount, adminCount, categoryCount, promptStats] = await Promise.all([
    User.count({ where: { deleted: false } }),
    User.count({ where: { deleted: false, role: 'admin' } }),
    Category.count({ where: { deleted: false } }),
    getPromptStats(),
  ]);

  return {
    userCount,
    adminCount,
    categoryCount,
    ...promptStats,
  };
}

module.exports = {
  getDashboardStats,
  listAdminPrompts,
  reviewPrompt,
  listUsers,
  updateUserRole,
  updateUserStatus,
};
