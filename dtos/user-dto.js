module.exports = class UserDto {
  role;
  email;
  id;

  constructor(model) {
    this.email = model.email;
    this.id = model._id;
    this.role = model.role;
  }
};
