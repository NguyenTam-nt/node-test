const mongooes = require("mongoose");

const Schema = mongooes.Schema;

const likepost = new Schema({
  idpost: { type: String },
  iduser: { type: String },
});

module.exports = mongooes.model("likepost", likepost);
