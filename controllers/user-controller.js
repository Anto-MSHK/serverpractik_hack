const { ObjectId } = require("mongodb");
const userModel = require("../models/userModel");
const userService = require("../services/user-service");
const jwt = require("jsonwebtoken");
const {
  validateRefreshToken,
  validateAccessToken,
} = require("../services/token-service");
class UserController {
  async registration(req, res, next) {
    try {
      const { email, name, department, isAccessHight } = req.body;
      const userData = await userService.registration(
        email,
        name,
        department,
        isAccessHight
      );
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await userService.login(email, password);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie("refreshToken");
      return res.json(token);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  async isCorrectActivateLink(req, res, next) {
    try {
      const activationLink = req.params.link;
      const result = await userService.isCorrectActivateLink(activationLink);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async activateAccount(req, res, next) {
    try {
      const { activationLink, password } = req.body;
      const result = await userService.activateAccount(
        activationLink,
        password
      );
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await userService.refresh(refreshToken);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      return res.json(users);
    } catch (err) {
      next(err);
    }
  }

  async getUser(req, res, next) {
    try {
      const user = await userService.getUser(req.params.id);
      console.log(user);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async change(req, res, next) {
    try {
      const { name, department, isAccessHight } = req.body;
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw res.status(400).json({
          status: "INVALID_DATA",
        });
      }
      const user = req.user;
      const userData = await userService.change(user.id, {
        name,
        department,
        isAccessHight,
      });
      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }

  //   --> tests <--

  async updatePicture(req, res, next) {
    upload(req, res, async (err) => {
      try {
        if (err) {
          res.sendStatus(500);
        }
        const userDTO = jwt.verify(
          req.headers.authorization,
          process.env.JWT_ACCESS_SECRET
        );
        const user = await userModel.findOne({ _id: new ObjectId(userDTO.id) });
        user.avatar = req.file.filename;
        await user.save();
        res.send(req.file);
      } catch (err) {
        next(err);
      }
    });
  }
}

module.exports = new UserController();
