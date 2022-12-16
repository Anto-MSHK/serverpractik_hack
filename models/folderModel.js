const { Schema, model } = require("mongoose");

const FolderSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  description: {
    type: String,
  },
  creator_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  files_id: {
    type: [Schema.Types.ObjectId],
    ref: "File",
  },
  createDate: {
    type: String,
    required: true,
  },
  editDate: {
    type: String,
  },
  isHidden: {
    type: Boolean,
    default: false,
    required: true,
  },
});

module.exports = model("Folder", FolderSchema);
