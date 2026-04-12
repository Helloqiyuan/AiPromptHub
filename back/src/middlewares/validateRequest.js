const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(422).json({
    code: 422,
    message: '请求参数校验失败',
    data: {
      errors: errors.array().map((item) => ({
        field: item.path,
        message: item.msg,
      })),
    },
  });
};

