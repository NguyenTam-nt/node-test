const users = require("./users");
const post = require("./post");
const opentimage = require("./openimage");
const notify = require("./notify");
const message = require("./message");

const router = (app) => {
  app.use("/users", users);
  app.use("/posts", post);
  app.use("/image", opentimage);
  app.use("/notify", notify);
  app.use("/message", message);
};

module.exports = router;
