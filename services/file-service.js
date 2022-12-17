const { ObjectId } = require("mongodb");
const fileModel = require("../models/fileModel");
const folderModel = require("../models/folderModel");
const fs = require("fs");
const ApiError = require("../exceptions/api-error");

class FileService {
  add = async (folder_id, name, description, isHidden, file, creator_id) => {
    //  try {
    if (!folder_id || !name) {
      throw ApiError.BadRequest("Нет папки!");
    }

    if (file.size > 20000000) {
      throw ApiError.BadRequest("Файл больше допустимого размера!");
    }

    const candidatefolder = await folderModel.findById(folder_id);

    if (!candidatefolder) {
      throw ApiError.BadRequest("Нет папки!");
    }
    const createDate = new Date();
    const type = file.name.split(".").pop();

    const isNotExist = await Promise.all(
      candidatefolder.files_id.map(async (file_id) => {
        return await fileModel.findOne({ _id: file_id, name: name });
      })
    );

    const filepath = `${process.cwd()}\\${process.env.FILE_PATH}\\${
      candidatefolder._id
    }\\${name}.${type}`;
    if (
      fs.existsSync(filepath) ||
      isNotExist.filter((cand) => cand).length > 0
    ) {
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
      creator_id,
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

  change = async (id, name, description, isHidden) => {
    const candidate = await fileModel.findOne({ _id: id });

    if (!candidate) {
      throw {
        status: "INVALID_DATA",
      };
    }
    const editDate = new Date();
    const newPath = `${candidate.url.split("\\")[0]}\\${
      candidate.url.split("\\")[1]
    }\\${candidate.url.split("\\")[2]}\\${name}.${candidate.extension}`;

    fs.rename(candidate.url, newPath, (e) => {});

    await candidate.updateOne({
      name,
      description,
      isHidden,
      editDate,
      url: newPath,
    });

    return candidate;
  };

  delete = async (id) => {
    const candidatefile = await fileModel.findOne({ _id: id });

    if (!candidatefile) {
      throw {
        status: "INVALID_DATA",
      };
    }

    if (fs.existsSync(candidatefile.url)) {
      fs.unlink(candidatefile.url, (err) => {});
    }

    await folderModel.findOneAndUpdate({
      $pull: { files_id: candidatefile._id },
    });

    await candidatefile.deleteOne({ _id: id });

    return { file: candidatefile };
  };
}

module.exports = new FileService();
