// const mysql = require("mysql");
// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "istagram",
// });
const mongoose = require("mongoose");
async function connection() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/f8_education_dev");
  } catch (error) {}
}

module.exports = connection;
