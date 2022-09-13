const express = require("express");
const fs = require("fs");
const path = require("path");
const parentPath = path.dirname(__dirname);
console.log(parentPath);

const route = express.Router();

route.get("/royal", (req, res) => {
  //"../myapp/src/public/images/" + req.query.image;
  let filename = `${parentPath}/public/images/` + req.query.image;
  fs.readFile(filename, (error, ImageData) => {
    if (!error) {
      res.writeHead(200, { "Content-Type": "image/jpeg" });
      res.end(ImageData);
    } else {
      res.json("lỗi");
    }
  });
});

route.get("/royal-video", (req, res) => {
  let filename = `${parentPath}/public/images/` + req.query.video;
  fs.readFile(filename, (error, ImageData) => {
    if (!error) {
      res.writeHead(200, { "Content-Type": "video/mp4" });
      res.end(ImageData);
    } else {
      res.json("lỗi");
    }
  });
});

module.exports = route;
