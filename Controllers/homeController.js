"use strict";
const connection = require("../Config");
const Course = require("../Models/CourseModel");

connection();
class homeController {
  index(req, res, next) {
    Course.find({})
      .then((courses) => res.render("index", { courses }))
      .catch(next);
  }

  Detail(req, res, next) {
    console.log(req.query);
    Course.findById(req.query.p, {}).then((course) =>
      res.render("detail", { course })
    );
  }
}

module.exports = new homeController();
