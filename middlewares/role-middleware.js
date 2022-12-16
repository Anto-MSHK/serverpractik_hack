const jwt = require('jsonwebtoken');
// const { secret } = require('../config/config');

module.exports = function (role) {
  return function(req, res, next) {

    if (req.method === 'OPTIONS') {
      next();
    }

    try {
      const token = req.headers.authorization.split(' ')[1];
      if (!token) {
        return res.status(483).json({ message: 'Пользователь не атворизован' });
      }

      const {role: userRole} = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      let hashRole = false;

      if (userRole === role) {
        hashRole = true;
      }

      if(!hashRole) {
        return res.status(403).json({message: 'У вас нет доступа'});
      }

      next();
    } catch (err) {
      console.log(err);
      return res.status(483).json({ message: 'Пользователь не атворизован' });
    }
  }
}