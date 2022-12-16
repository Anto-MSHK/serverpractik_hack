const ApiError = require("../exceptions/api-error");
const fileModel = require("../models/fileModel");
const folderModel = require("../models/folderModel");
const userModel = require("../models/userModel");
const fileService = require("../services/file-service");

class FileController {
  add = async (req, res, next) => {
    try {
      let file = req.files.file;
      const { folder_id, name, description, isHidden } = req.body;
      const fileColl = await fileService.add(
        folder_id,
        name,
        description,
        isHidden,
        file
      );
      return res.json({ fileColl });
    } catch (e) {
      next(e);
    }
  };
  change = async (req, res, next) => {
    try {
      const { id } = req.params;
      const candidate = await fileModel.findOne({ _id: id });
      if (!candidate)
        throw res.status(400).json({
          status: "INVALID_DATA",
        });
      const { name, description, isHidden } = req.body;
      const file = await fileService.change(id, name, description, isHidden);

      return res.json({ status: "OK", result: file });
    } catch (e) {
      next(e);
    }
  };
  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const candidate = await fileModel.findOne({ _id: id });
      if (!candidate)
        throw res.status(400).json({
          status: "INVALID_DATA",
        });
      const file = await fileService.delete(candidate._id);
      return res.json({ status: "OK", result: file });
    } catch (e) {
      next(e);
    }
  };
  get = async (req, res, next) => {
    try {
      const { id } = req.query;
      let files = [];

      const user = await userModel.findById(req.user.id);
      if (user.isAccessHight) {
        if (!id) files = await fileModel.find({});
        else {
          files = await fileModel.findOne({ _id: id });
        }
        return res.json({ status: "OK", result: files });
      } else {
        if (!id) {
          const folders = await folderModel.find({ isHidden: false });
          files = await Promise.all(
            folders.map(async (folder) => {
              return await Promise.all(
                folder.files_id.map(async (file_id) => {
                  return await fileModel.findOne({
                    _id: file_id,
                    isHidden: false,
                  });
                })
              );
            })
          );
          let arr = [];
          files.forEach((array) => {
            arr = arr.concat(array);
          });
          return res.json({
            status: "OK",
            result: arr.filter((cand) => cand !== null),
          });
        } else {
          files = await fileModel.findById(id);
          if (files.isHidden)
            throw ApiError.BadRequest("Данной записи не существует!");

          const folder = await folderModel.findOne({
            files_id: { $elemMatch: { $eq: id } },
          });

          if (!folder || folder.isHidden) {
            throw ApiError.BadRequest("Данной записи не существует!");
          }

          return res.json({ status: "OK", result: files });
        }
      }
    } catch (e) {
      next(e);
    }
  };
}

module.exports = new FileController();
