const mongooes = require("mongoose");

const Schema = mongooes.Schema;

const notify = new Schema({
  idUserOutGoing: { type: String },
  idUserInComing: { type: String },
  Content: { type: String },
  Type: { type: String },
  link: { type: String },
  isSee: { type: Boolean, default: false },
  isAccept: { type: Boolean, default: false },
  create_day: { type: Date, default: Date.now() },
  update_day: { type: Date, default: Date.now() },
});

module.exports = mongooes.model("notify", notify);
