const ApiError = require('../exceptions/api-error');

module.exports = function (err, req, res, next) {
  if (err instanceof ApiError) {
    console.log(err.message, err.errors)
    return res.status(err.status).json({message: err.message, errors: err.errors})
  }
  return res.status(500).json({message: 'Непридвиденная ошибка'})
}