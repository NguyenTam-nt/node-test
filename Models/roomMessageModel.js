const mongooes = require("mongoose");

const Schema = mongooes.Schema;

const roomMessage = new Schema({
  iduser1: { type: String },
  iduser2: { type: String },
  updated_at: { type: Date, default: Date.now() },
  created_at: { type: Date, default: Date.now() },
});

module.exports = mongooes.model("roomMessage", roomMessage);
