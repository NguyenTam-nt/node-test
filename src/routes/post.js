const express = require("express");
const homeController = require("../../Controllers/homeController");

const route = express.Router();

route.get("/", homeController.accepToken, homeController.getPosts);
route.get(
  "get-curuser-like",
  homeController.accepToken,
  homeController.getCrUserLikePost
);

route.get(
  "/get-post/user",
  homeController.accepToken,
  homeController.getPostOfCurrent
);

route.get(
  "/get-images",
  homeController.accepToken,
  homeController.getImageOfUser
);
route.get("/search-post", homeController.searchPost);

route.post("/add-post", homeController.accepToken, homeController.addPost);
route.post(
  "/update-post",
  homeController.accepToken,
  homeController.updatePost
);
route.post("/add-comment", homeController.addComment);
route.post("/delete-post", homeController.deletePost);

route.post("/like-post", homeController.likePost);
module.exports = route;
