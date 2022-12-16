const UserModel = require("../models/userModel");
const Role = require("../models/roleModel");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
// const mailService = require("./mail-service");
const tokenService = require("./token-service");
const UserDto = require("../dtos/user-dto");
const ApiError = require("../exceptions/api-error");

class UserService {
  async registration(email, name, department, isAccessHight) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(
        `Пользователь с почтовым адресом ${email} уже существует`
      );
    }

    const activationLink = uuid.v4();

    const userRole = await Role.findOne({ value: "USER" });
    const user = await UserModel.create({
      email,
      name,
      department,
      isAccessHight,
      activationLink,
      role: userRole.value,
    });

    await user.save();
    //  await mailService.sendActivationMail(
    //    email,
    //    `${process.env.API_URL}/api/activate/${activationLink}`
    //  );

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async isCorrectActivateLink(activationLink) {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest("Неккоректная ссылка авторизации");
    }
    return { result: "ok" };
  }

  async activateAccount(activationLink, password) {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest("Неккоректная ссылка авторизации");
    }
    const hashPassword = await bcrypt.hash(password, 3);
    user.password = hashPassword;
    await user.save();
    return { result: "ok" };
  }

  async login(email, password) {
    const candidate = await UserModel.findOne({ email });
    if (!candidate || candidate.password === "") {
      throw ApiError.BadRequest(`Пользовать с почтой ${email} не найден`);
    }

    const isPasswordEquals = await bcrypt.compare(password, candidate.password);

    if (!isPasswordEquals) {
      throw ApiError.BadRequest("Неверный пароль");
    }

    const userDto = new UserDto(candidate);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);

    const tokenFromDb = tokenService.findToken(refreshToken);

    if (!tokenFromDb || !userData) {
      throw ApiError.UnauthorizedError();
    }

    const user = await UserModel.findById(userData.id); ///_id
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async getAllUsers() {
    const users = await UserModel.find();
    return users;
  }

  async getUser(id) {
    const user = await UserModel.findOne({ _id: id });
    return user;
  }

  async change(id, body) {
    const { name, department, isAccessHight } = body;
    const user = await UserModel.findOne({ _id: id });
    if (!user) {
      throw {
        status: "INVALID_DATA",
      };
    }

    await user.updateOne({ name, department, isAccessHight });

    return user;
  }
}

module.exports = new UserService();
