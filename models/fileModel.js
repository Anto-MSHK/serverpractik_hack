const { Schema, model } = require("mongoose");

const FileSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  description: {
    type: String,
  },
  size: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    unique: true,
    required: true,
  },
  extension: {
    type: String,
    required: true,
  },
  creator_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
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

module.exports = model("File", FileSchema);
