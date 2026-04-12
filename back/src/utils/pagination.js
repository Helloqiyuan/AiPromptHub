function normalizePagination(query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(query.pageSize) || 10, 1), 50);

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
    limit: pageSize,
  };
}

function buildPaginationResult({ count, rows }, page, pageSize) {
  return {
    list: rows,
    pagination: {
      page,
      pageSize,
      total: count,
      totalPages: Math.ceil(count / pageSize),
    },
  };
}

module.exports = {
  normalizePagination,
  buildPaginationResult,
};

