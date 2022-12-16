const fileModel = require("../models/fileModel");
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
}

module.exports = new FileController();
