function buildCommentTree(comments, parentId = 0) {
  return comments
    .filter((item) => Number(item.parentId || 0) === Number(parentId))
    .map((item) => ({
      ...item,
      children: buildCommentTree(comments, item.id),
    }));
}

module.exports = {
  buildCommentTree,
};

