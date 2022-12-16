const RoleModel = require('../models/roleModel');

module.exports.createRole = async function (req, res, next) {
  try {
    await RoleModel.create({value: req.body.value})
  } catch(err) {
    next(err)
  }
}