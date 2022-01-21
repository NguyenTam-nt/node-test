const mongoose = require("mongoose");
const Shema = mongoose.Schema;

const post = new Shema({
  title: { type: String },
  userid: { type: String },
  video: { type: String },
  image: { type: String },
  content: { type: String },
  liked: { type: Array },
  comments: [
    {
      iduser: { type: String },
      comment: { type: String },
      create_at: { type: Date, default: Date.now },
      update_at: { type: Date, default: Date.now },
    },
  ],
  isPublic: { type: Boolean, default: true },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("post", post);
