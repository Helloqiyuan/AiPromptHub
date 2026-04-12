const createError = require('http-errors');

const { sequelize, Comment, Prompt, User } = require('../models');
const { USER_ROLES, PROMPT_STATUS } = require('../config/constants');
const { buildCommentTree } = require('../utils/commentTree');
const { refreshPromptCounters } = require('./promptService');

function isAdmin(user) {
  return [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user?.role);
}

async function createComment(payload, currentUser) {
  return sequelize.transaction(async (transaction) => {
    const prompt = await Prompt.findOne({
      where: {
        id: payload.promptId,
        deleted: false,
        status: PROMPT_STATUS.PUBLISHED,
      },
      transaction,
    });

    if (!prompt) {
      throw createError(404, 'Prompt不存在');
    }

    let replyUserId = null;

    if (payload.parentId) {
      const parentComment = await Comment.findOne({
        where: {
          id: payload.parentId,
          promptId: payload.promptId,
          deleted: false,
        },
        transaction,
      });

      if (!parentComment) {
        throw createError(404, '父评论不存在');
      }

      replyUserId = parentComment.userId;
    }

    const comment = await Comment.create(
      {
        promptId: payload.promptId,
        userId: currentUser.id,
        parentId: payload.parentId || 0,
        replyUserId,
        content: payload.content,
      },
      { transaction },
    );

    await refreshPromptCounters(payload.promptId, transaction);

    return Comment.findOne({
      where: { id: comment.id },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar'],
          required: false,
        },
        {
          model: User,
          as: 'replyUser',
          attributes: ['id', 'username', 'avatar'],
          required: false,
        },
      ],
      transaction,
    });
  });
}

async function getCommentTree(promptId) {
  const prompt = await Prompt.findOne({
    where: {
      id: promptId,
      deleted: false,
    },
  });

  if (!prompt) {
    throw createError(404, 'Prompt不存在');
  }

  const comments = await Comment.findAll({
    where: {
      promptId,
      deleted: false,
    },
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'avatar'],
        required: false,
      },
      {
        model: User,
        as: 'replyUser',
        attributes: ['id', 'username', 'avatar'],
        required: false,
      },
    ],
    order: [
      ['parentId', 'ASC'],
      ['createTime', 'ASC'],
    ],
  });

  const plainComments = comments.map((item) => item.get({ plain: true }));
  return buildCommentTree(plainComments, 0);
}

function collectDescendantIds(targetId, comments) {
  const children = comments.filter((item) => Number(item.parentId) === Number(targetId));
  const result = [Number(targetId)];

  children.forEach((item) => {
    result.push(...collectDescendantIds(item.id, comments));
  });

  return result;
}

async function deleteComment(commentId, currentUser) {
  return sequelize.transaction(async (transaction) => {
    const comment = await Comment.findOne({
      where: {
        id: commentId,
        deleted: false,
      },
      transaction,
    });

    if (!comment) {
      throw createError(404, '评论不存在');
    }

    if (!isAdmin(currentUser) && Number(comment.userId) !== Number(currentUser.id)) {
      throw createError(403, '没有删除该评论的权限');
    }

    const allComments = await Comment.findAll({
      where: {
        promptId: comment.promptId,
        deleted: false,
      },
      transaction,
    });

    const ids = collectDescendantIds(comment.id, allComments.map((item) => item.get({ plain: true })));

    await Comment.update(
      { deleted: true },
      {
        where: {
          id: ids,
        },
        transaction,
      },
    );

    await refreshPromptCounters(comment.promptId, transaction);

    return {
      deletedIds: ids,
    };
  });
}

module.exports = {
  createComment,
  getCommentTree,
  deleteComment,
};
