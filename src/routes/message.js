const express = require("express");
const messageController = require("../../Controllers/messageController");

const router = express.Router();

router.get("/get-room", messageController.getRoom);
router.get("/get-messages", messageController.getMessage);
router.post("/create-room", messageController.createRoom);
router.post("/add-message", messageController.addMessage);

module.exports = router;
