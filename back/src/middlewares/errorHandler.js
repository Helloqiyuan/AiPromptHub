module.exports = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || '服务器内部错误';

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    code: statusCode,
    message,
    data: err.data || null,
  });
};

