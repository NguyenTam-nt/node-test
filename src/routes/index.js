var express = require("express");
var router = express.Router();

const homeController = require("../../Controllers/homeController");

/* GET home page. */
router.get("/", homeController.index);
router.get("/detail", homeController.Detail);

module.exports = router;
