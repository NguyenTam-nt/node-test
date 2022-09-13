const mongooes = require("mongoose");

const Schema = mongooes.Schema;

const messages = new Schema({
  idroom: { type: String },
  iduser: { type: String },
  message: { type: String },
  video: { type: String },
  image: { type: String },
  isSeen: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now() },
  updated_at: { type: Date, default: Date.now() },
});

module.exports = mongooes.model("messages", messages);
