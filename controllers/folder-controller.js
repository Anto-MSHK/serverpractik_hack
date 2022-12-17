const folderModel = require("../models/folderModel");
const fileModel = require("../models/fileModel");
const userModel = require("../models/userModel");
const folderService = require("../services/folder-service");
const ApiError = require("../exceptions/api-error");

class FolderController {
  add = async (req, res, next) => {
    try {
      const user = await userModel.findById(req.user.id);
      const { name, description, isHidden } = req.body;
      const folder = await folderService.add(
        name,
        description,
        isHidden,
        user._id
      );
      return res.json({ status: "OK", result: folder });
    } catch (e) {
      next(e);
    }
  };
  change = async (req, res, next) => {
    try {
      const { id } = req.params;
      const candidate = await folderModel.findOne({ _id: id });
      if (!candidate)
        throw res.status(400).json({
          status: "INVALID_DATA",
        });
      const { name, description, isHidden } = req.body;
      const folder = await folderService.change(
        id,
        name,
        description,
        isHidden
      );

      return res.json({ status: "OK", result: folder });
    } catch (e) {
      next(e);
    }
  };
  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const candidate = await folderModel.findOne({ _id: id });
      if (!candidate)
        throw res.status(400).json({
          status: "INVALID_DATA",
        });
      const folder = await folderService.delete(candidate._id);
      return res.json({ status: "OK", result: folder });
    } catch (e) {
      next(e);
    }
  };

  get = async (req, res, next) => {
    try {
      const { id } = req.query;
      let folder = [];

      const user = await userModel.findById(req.user.id);
      if (user.isAccessHight) {
        if (!id) {
          folder = await folderModel.find({});
          return res.json({ status: "OK", result: { folder } });
        } else {
          folder = await folderModel.findOne({ _id: id });
          const arrFiles = await Promise.all(
            folder.files_id.map(async (file_id) => {
              const candidateFile = await fileModel.findById(file_id);
              return candidateFile;
            })
          );
          let result = {
            folder: folder,
            files: arrFiles,
          };
          return res.json({ status: "OK", result: result });
        }
      } else {
        if (!id) {
          folder = await folderModel.find({ isHidden: false });
          return res.json({ status: "OK", result: { folder } });
        } else {
          folder = await folderModel.findOne({ _id: id, isHidden: false });
          if (!folder) {
            throw ApiError.BadRequest("Записи не существует");
          }
          const arrFiles = await Promise.all(
            folder.files_id.map(async (file_id) => {
              const candidateFile = await fileModel.findOne({
                _id: file_id,
                isHidden: false,
              });
              return candidateFile;
            })
          );
          let result = {
            folder: folder,
            files: arrFiles.filter((cand) => cand !== null),
          };
          return res.json({ status: "OK", result });
        }
      }
    } catch (e) {
      next(e);
    }
  };
}

module.exports = new FolderController();
