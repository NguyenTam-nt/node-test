const users = require("../Models/userModel");
const userFriends = require("../Models/userFriend");
const jwt = require("jsonwebtoken");
const path = require("path");
const url = path.dirname(__dirname);
const fs = require("fs");

class userController {
  addUser(req, res, next) {
    users.find({ $or: [{ email: req.body.email }] }, (error, data) => {
      if (!data[0]) {
        const user = new users();
        user.username = req.body.username;
        user.email = req.body.email;
        user.password = new Buffer(req.body.password, "base64");

        user
          .save()
          .then(() => {
            res.json({ status: 200 });
          })
          .catch(() => res.sendStatus(500));
      } else {
        res.json({ status: 401 });
      }
    });
  }
  confirmEmail(req, res, next) {
    users.find({ email: req.body.email }, (error, data) => {
      if (data[0]) {
        res.json({ status: 401 });
      }
    });
  }

  login(req, res, next) {
    const password = new Buffer(req.body.password, "base64");

    try {
      users.find(
        { email: req.body.email, password: password },
        (error, datas) => {
          if (!error) {
            if (!datas[0]) {
              res.json({ status: 401 });
            } else {
              const accessToken = jwt.sign(
                { email: req.body.email },
                process.env.ACCESS_TOKEN_SECRET,
                {
                  expiresIn: `${60 * 60}s`,
                }
              );

              const refreshToken = jwt.sign(
                { email: req.body.email },
                process.env.REFRESH_TOKEN_SECRET,
                {
                  expiresIn: `${7 * 24 * 60 * 60}s`,
                }
              );

              users
                .updateOne({ email: req.body.email }, { token: refreshToken })
                .then((user) => {
                  res.json({
                    status: 200,
                    user: {
                      _id: datas[0]._id,
                      username: datas[0].username,
                      thumbnail: datas[0].thumbnail,
                      email: datas[0].email,
                    },
                    refreshToken,
                    accessToken,
                  });
                })
                .catch((error) => {
                  res.senStatus(500).json("lỗi");
                });
            }
          }
        }
      );
    } catch (error) {
      res.senStatus(500).json("lỗi");
    }
  }

  refreshToken(req, res, next) {
    if (!req.body.refreshToken) res.json({ status: 500 });

    users.find({ token: req.body.refreshToken }, (error, data) => {
      if (!error && data[0]) {
        jwt.verify(
          req.body.refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
          (error, docs) => {
            if (error) res.json({ status: 401 });
            const accessToken = jwt.sign(
              { email: docs?.email },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: `${300 * 60}s` }
            );

            res.json({
              status: 200,
              accessToken,
              user: {
                _id: data[0]._id,
                username: data[0].username,
                thumbnail: data[0].thumbnail,
                email: data[0].email,
              },
            });
          }
        );
      }
    });
  }
  getUserNoFriend(req, res) {
    userFriends.find(
      { $or: [{ iduser1: req.query.id }, { iduser2: req.query.id }] },
      async (error, usrfr) => {
        if (!error) {
          let listUserFriend = await usrfr.map((u) => {
            return u.iduser1 === req.query.id ? u.iduser2 : u.iduser1;
          });
          listUserFriend.push(req.query.id);
          // console.log(listUserFriend);
          users.find({ _id: { $nin: listUserFriend } }, (error, data) => {
            if (!error) {
              req.app.io.emit(req.query.id + "_getuser", { data });
              res.json({ data });
            }
          });
        }
      }
    );
  }

  async getUserFriend(req, res) {
    const { limit, name } = req.query;

    const userCrr = await users.find({ username: name });

    const user_friend_news = await userFriends
      .find({ $or: [{ iduser1: userCrr[0]._id }, { iduser2: userCrr[0]._id }] })
      .sort({ created_at: -1 });

    let listUserFriend = await user_friend_news.map((u) =>
      u.iduser1 === userCrr[0]._id.toString() ? u.iduser2 : u.iduser1
    );

    users.find(
      { _id: { $in: listUserFriend } },
      { username: 1, thumbnail: 1 },
      (error, data) => {
        res.json({
          status: 200,
          count: data.length,
          list: data.slice(0, limit),
        });
      }
    );
  }
  getUserSearch(req, res) {
    const { keyword, _u } = req.query;
    console.log({ keyword, _u });
    users
      .find(
        { username: { $regex: keyword, $options: "i" }, _id: { $ne: _u } },
        { username: 1, thumbnail: 1 },
        (error, doc) => {
          if (!error) {
            res.json({ doc });
          }
        }
      )
      .limit(10);
  }

  async editSubText(req, res) {
    const { iduser, subText } = req.body;
    const user = await users.findById(iduser, { password: 0, token: 0 });

    user.subtext = subText;
    user.save();
    res.json(user);
  }
  async editProfile(req, res) {
    if (req.files) {
      const { fileProfile, fileCoverPhoto } = req.files;
      let nameProfile, nameCoverPhoto;
      if (fileProfile) {
        nameProfile =
          (await fileProfile.md5) +
          Math.floor(Math.random() * 10000) +
          fileProfile.name;

        fileProfile.mv(`${url}/src/public/images/${nameProfile}`);
      }

      if (fileCoverPhoto) {
        nameCoverPhoto =
          (await fileCoverPhoto.md5) +
          Math.floor(Math.random() * 10000) +
          fileCoverPhoto.name;
        fileCoverPhoto.mv(`${url}/src/public/images/${nameCoverPhoto}`);
      }

      const user = await users.findById(req.data._id, {
        password: 0,
        token: 0,
      });
      if (nameProfile) {
        fs.unlinkSync(`${url}\\src\\public\\images\\${user.thumbnail}`);
        user.thumbnail = nameProfile;
      }
      if (nameCoverPhoto) {
        fs.unlinkSync(`${url}\\src\\public\\images\\${user.cover_photo}`);
        user.cover_photo = nameCoverPhoto;
      }

      user.save();
      res.json(user);
    }
  }

  async editUserExtention(req, res) {
    const { field, text } = req.body;
    const user = await users.findById(req.data._id, { password: 0, token: 0 });
    user[field] = text;
    user.save();
    res.json(user);
  }

  async getFriendOfUserSelect(req, res) {
    const { _id } = req.query;
    const listUser = await userFriends.find({
      $or: [{ iduser1: _id }, { iduser2: _id }],
    });

    const lisUserId = listUser.map((user) => {
      return user.iduser1.toString() === _id ? user.iduser2 : user.iduser1;
    });

    const listUserNew = await users.find(
      { _id: { $in: lisUserId } },
      { username: 1, thumbnail: 1 }
    );
    res.json({ users: listUserNew });
  }

  unFriend(req, res) {
    const { id } = req.body;
    userFriends.findOneAndDelete(
      {
        $or: [
          { iduser1: id, iduser2: req.data._id },
          { iduser1: req.data._id, iduser2: id },
        ],
      },
      (error, data) => {
        if (!error) {
          res.json({ id: id });
        }
      }
    );
  }
}

module.exports = new userController();
