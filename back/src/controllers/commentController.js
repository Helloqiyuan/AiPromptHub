const { success } = require('../utils/apiResponse');
const commentService = require('../services/commentService');

async function createComment(req, res, next) {
  try {
    const data = await commentService.createComment(req.body, req.user);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function getCommentTree(req, res, next) {
  try {
    const data = await commentService.getCommentTree(Number(req.query.promptId));
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

async function deleteComment(req, res, next) {
  try {
    const data = await commentService.deleteComment(Number(req.params.id), req.user);
    res.json(success(data));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createComment,
  getCommentTree,
  deleteComment,
};
