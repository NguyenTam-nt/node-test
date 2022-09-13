var express = require("express");
var router = express.Router();
const userController = require("../../Controllers/userController");
const HomeController = require("../../Controllers/homeController");

/* GET users listing. */
router.get("/", (req, res) => {
  res.send("OK");
});
router.get("/get-users", userController.getUserNoFriend);
router.get("/get-user/search", userController.getUserSearch);
router.get("/user-friend", userController.getUserFriend);
router.get("/get-friend/user-select", userController.getFriendOfUserSelect);
router.post("/refresh-token", userController.refreshToken);

router.post("/add-user", userController.addUser);
router.post("/sign-up/email", userController.confirmEmail);
router.post("/login-user", userController.login);
router.post("/edit-subtext", userController.editSubText);
router.post(
  "/edit-user/extention",
  HomeController.accepToken,
  userController.editUserExtention
);
router.post(
  "/edit-profile",
  HomeController.accepToken,
  userController.editProfile
);

router.post("/un-friend", HomeController.accepToken, userController.unFriend);

module.exports = router;
