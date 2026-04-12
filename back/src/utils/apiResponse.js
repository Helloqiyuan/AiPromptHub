function success(data = null, message = 'success') {
  return {
    code: 0,
    message,
    data,
  };
}

module.exports = {
  success,
};

