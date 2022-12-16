const folderModel = require("../models/folderModel");
const folderService = require("../services/folder-service");

class FolderController {
  add = async (req, res, next) => {
    try {
      const { name, description, isHidden } = req.body;
      const folder = await folderService.add(name, description, isHidden);
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
      if (!id) folder = await folderModel.find({});
      else {
        folder = await folderModel.findOne({ _id: id });
        const arrTasks = await Promise.all(
          folder.tasks_id.map(async (task_id) => {
            const candidateTask = await taskModel.findOne({ _id: task_id });
            const variants = await Promise.all(
              candidateTask.variants_id.map(async (variant_id) => {
                const candidateVariant = await variantModel.findOne({
                  _id: variant_id,
                });
                return candidateVariant;
              })
            );
            return {
              _id: candidateTask._id,
              title: candidateTask.title,
              description: candidateTask.description,
              type: candidateTask.type,
              variants: variants,
            };
          })
        );
        let result = {
          name: folder.name,
          description: folder.description,
          tasks: arrTasks,
        };
        return res.json({ status: "OK", result });
      }
      return res.json({ status: "OK", result: folder });
    } catch (e) {
      next(e);
    }
  };
}

module.exports = new FolderController();
