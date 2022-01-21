const express = require("express");
const notifyController = require("../../Controllers/notifyController");

const route = express.Router();

route.get("/get-notify", notifyController.getNotify);
route.get("/notify-action", notifyController.getNotifyAddFriend);

route.post("/accept-friend", notifyController.acceptFriend);
route.post("/send-add-friend", notifyController.sendNotifyAddFriend);

module.exports = route;
