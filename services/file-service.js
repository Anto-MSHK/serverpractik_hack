const { ObjectId } = require("mongodb");
const fileModel = require("../models/fileModel");
const folderModel = require("../models/folderModel");
const fs = require("fs");
const ApiError = require("../exceptions/api-error");

class FileService {
  add = async (folder_id, name, description, isHidden, file) => {
    //  try {
    if (!folder_id || !name) {
      throw {
        status: "INVALID_DATA",
      };
    }

    const candidatefolder = await folderModel.findById(folder_id);

    if (!candidatefolder) {
      throw {
        status: "INVALID_DATA",
      };
    }
    const createDate = new Date();
    const type = file.name.split(".").pop();

    const filepath = `${process.env.FILE_PATH}\\${candidatefolder._id}\\${name}.${type}`;
    if (fs.existsSync(filepath)) {
      throw ApiError.BadRequest("Данный файл уже существует!");
    }
    file.mv(filepath);
    const fileColl = new fileModel({
      name,
      description,
      isHidden,
      createDate,
      size: file.size,
      extension: type,
      url: filepath,
    });

    await fileColl.save();

    await candidatefolder.updateOne({
      $addToSet: { files_id: new ObjectId(fileColl._id) },
    });
    return { file: fileColl };
    //  } catch (e) {
    //    throw ApiError.BadRequest("Неизвестная ошибка!");
    //  }
  };

  change = async (id, title, description, type) => {
    const candidate = await fileModel.findOne({ _id: id });

    if (!candidate) {
      throw {
        status: "INVALID_DATA",
      };
    }

    await candidate.updateOne({ title, description, type });

    return candidate;
  };

  delete = async (id) => {
    const candidatefile = await fileModel.findOne({ _id: id });

    if (!candidatefile) {
      throw {
        status: "INVALID_DATA",
      };
    }

    const candidatefolder = await folderModel.findOne({
      $pull: { files_id: candidatefile._id },
    });

    await candidatefile.deleteOne({ _id: id });

    return { file: candidatefile };
  };
}

module.exports = new FileService();