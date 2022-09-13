const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const users = new Schema({
  username: { type: String },
  email: { type: String },
  thumbnail: { type: String, default: "macdinh.jpg" },
  cover_photo: { type: String, default: "default_cover_photo.jpg" },
  password: { type: String },
  subtext: { type: String, maxlength: 200 },
  status: { type: Boolean, default: false },
  address: { type: String },
  phone: { type: String },
  live_in: { type: String },
  hobbies: { type: String },
  token: { type: String, default: "mytoken" },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("users", users);
