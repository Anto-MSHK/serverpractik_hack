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
}

module.exports = new FileController();
