const mongoose = require("mongoose");
const Shema = mongoose.Schema;

const Course = new Shema({
  name: { type: String },
  description: { type: String },
  image: { type: String },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Course", Course);
