const mongooes = require("mongoose");

const Schema = mongooes.Schema;

const follower = new Schema({
  iduserfollow: { type: String },
  iduserisfollow: { type: String },
  updated_at: { type: Date, default: Date.now() },
  created_at: { type: Date, default: Date.now() },
});

module.exports = mongooes.model("follower", follower);
