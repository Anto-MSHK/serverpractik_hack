const folderModel = require("../models/folderModel");
const fs = require("fs");
const fileModel = require("../models/fileModel");
class FolderService {
  add = async (name, description, isHidden) => {
    try {
      if (!name) {
        throw {
          status: "INVALID_DATA",
        };
      }

      const createDate = new Date();
      const folder = new folderModel({
        name,
        description,
        isHidden,
        createDate,
      });
      let a = folder._id.toString();
      fs.mkdirSync(`.\\files\\${a}`, { recursive: true });

      await folder.save();

      return folder;
    } catch (e) {
      return [];
    }
  };

  change = async (id, name, description, isHidden) => {
    try {
      const candidate = await folderModel.findOne({ _id: id });

      if (!candidate) {
        throw {
          status: "INVALID_DATA",
          messages: [{ description: errorsMSG.NOT_Z }],
        };
      }
      const editDate = new Date();
      await candidate.updateOne({ name, description, isHidden, editDate });

      return candidate;
    } catch (e) {
      return e;
    }
  };

  delete = async (id) => {
    try {
      const candidate = await folderModel.findOne({ _id: id });

      if (!candidate) {
        throw {
          status: "INVALID_DATA",
          messages: [{ description: errorsMSG.NOT_Z }],
        };
      }

      if (fs.existsSync(`.\\files\\${candidate._id}`)) {
        fs.rmSync(`.\\files\\${candidate._id}`, {
          recursive: true,
          force: true,
        });
      }

      await Promise.all(
        candidate.files_id.map(async (_id) => {
          await fileModel.findByIdAndDelete(_id);
        })
      );

      await candidate.deleteOne({ _id: id });

      return candidate;
    } catch (e) {
      return [];
    }
  };
}

module.exports = new FolderService();
