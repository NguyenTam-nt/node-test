const mongooes = require("mongoose");

const Schema = mongooes.Schema;

const comment = new Schema({
  idpost: { type: String },
  iduser: { type: String },
  comment: { type: String },
  updated_at: { type: Date, default: Date.now() },
  created_at: { type: Date, default: Date.now() },
});

module.exports = mongooes.model("comment", comment);
