const ApiError = require("../exceptions/api-error");
const fileModel = require("../models/fileModel");
const folderModel = require("../models/folderModel");
const userModel = require("../models/userModel");
const fileService = require("../services/file-service");

class FileController {
  add = async (req, res, next) => {
    try {
      let file = req.files.file;
      const user = await userModel.findById(req.user.id);
      const { folder_id, name, description, isHidden } = req.body;
      const fileColl = await fileService.add(
        folder_id,
        name,
        description,
        isHidden,
        file,
        user._id
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
        if (!id) {
          files = await fileModel.find({});
          files = await Promise.all(
            files.map(async (file) => {
              const folder = await folderModel.findOne({
                files_id: { $elemMatch: { $eq: file._id } },
              });
              return {
                _id: file._id,
                name: file.name,
                url: file.url,
                isHidden: file.isHidden,
                creator_id: file.creator_id,
                createDate: file.createDate,
                extension: file.extension,
                editDate: file.editDate,
                description: file.description,
                size: file.size,

                folder: { _id: folder._id, name: folder.name },
              };
            })
          );
        } else {
          const filesWithFolder = await fileModel.findOne({ _id: id });
          const folder = await folderModel.findOne({
            files_id: { $elemMatch: { $eq: id } },
          });
          files = {
            _id: filesWithFolder._id,
            name: filesWithFolder.name,
            url: filesWithFolder.url,
            isHidden: filesWithFolder.isHidden,
            creator_id: filesWithFolder.creator_id,
            createDate: filesWithFolder.createDate,
            extension: filesWithFolder.extension,
            editDate: filesWithFolder.editDate,
            description: filesWithFolder.description,
            size: filesWithFolder.size,
            folder: { _id: folder._id, name: folder.name },
          };
        }
        return res.json({ status: "OK", result: files });
      } else {
        if (!id) {
          const folders = await folderModel.find({ isHidden: false });
          files = await Promise.all(
            folders.map(async (folder) => {
              return await Promise.all(
                folder.files_id.map(async (file_id) => {
                  const file = await fileModel.findOne({
                    _id: file_id,
                    isHidden: false,
                  });
                  if (file !== null)
                    return {
                      _id: file._id,
                      name: file.name,
                      url: file.url,
                      isHidden: file.isHidden,
                      creator_id: file.creator_id,
                      createDate: file.createDate,
                      extension: file.extension,
                      editDate: file.editDate,
                      description: file.description,
                      size: file.size,
                      folder: { _id: folder._id, name: folder.name },
                    };
                  else undefined;
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
            result: arr.filter((cand) => cand),
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

          return res.json({
            status: "OK",
            result: {
              _id: files._id,
              name: files.name,
              url: files.url,
              isHidden: files.isHidden,
              creator_id: files.creator_id,
              createDate: files.createDate,
              extension: files.extension,
              editDate: files.editDate,
              description: files.description,
              size: files.size,
              folder: { id: folder._id, name: folder.name },
            },
          });
        }
      }
    } catch (e) {
      next(e);
    }
  };
}

module.exports = new FileController();
