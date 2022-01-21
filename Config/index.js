// const mysql = require("mysql");
// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "istagram",
// });
const mongoose = require("mongoose");
async function connection() {
  //v2YT6OvCB5GsLm1a
  try {
    await mongoose
      .connect(
        "mongodb+srv://user:v2YT6OvCB5GsLm1a@cluster0.x5r2g.mongodb.net/Courses?retryWrites=true&w=majority",
        { useNewUrlParser: true, useUnifiedTopology: true }
      )
      .then(() => {
        console.log("connect success");
      })
      .catch((error) => console.log("error:" + error));
  } catch (error) {}
}

module.exports = connection;
