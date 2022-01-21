const notify = require("../Models/notifyModel");
const users = require("../Models/userModel");
const userFriends = require("../Models/userFriend");

class notifyController {
  getNotify(req, res) {
    notify
      .find(
        { idUserInComing: req.query._u, isAccept: false },
        async (error, data) => {
          if (!error) {
            if (data[0]) {
              const notifys = await data.map(async (noti, index) => {
                const userList = await users.findById(noti.idUserOutGoing, {
                  username: 1,
                  thumbnail: 1,
                });

                return {
                  ...userList._doc,
                  ...noti._doc,
                };
              });

              Promise.all(notifys).then((data) => {
                req.app.io.emit(`${req.query._u}_getNotify`, data);
                res.json({ status: 200 });
              });
            }
          }
        }
      )
      .sort({ create_day: -1 });
  }

  sendNotifyAddFriend(req, res) {
    const { outGoing, inComing } = req.body;
    users.findById(outGoing, (error, user) => {
      if (!error && user !== null) {
        const notifySendAdd = {
          idUserOutGoing: outGoing,
          idUserInComing: inComing,
          Content: "đã gửi lời mời kết bạn",
          Type: "ADD_FRIEND",
        };

        notify.create(notifySendAdd, (error, notifyAddFriend) => {
          if (!error) {
            req.app.io.emit(`${inComing}_sendFriend`, {
              username: user.username,
              thumbnail: user.thumbnail,
              ...notifyAddFriend._doc,
            });

            res.json({
              username: user.username,
              thumbnail: user.thumbnail,
              ...notifyAddFriend._doc,
            });
          }
        });
      }
    });
  }

  acceptFriend(req, res) {
    notify.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { isSee: true, isAccept: true } },
      (error, data) => {
        if (!error) {
          users.findById(data.idUserInComing, (error, user) => {
            if (!error) {
              const noti = {
                idUserOutGoing: data.idUserInComing,
                idUserInComing: data.idUserOutGoing,
                Content: "đã chấp nhận lời mời kết bạn",
                Type: "normal",
              };
              notify.create(noti, (error, noti) => {
                if (!error) {
                  req.app.io.emit(`${data.idUserOutGoing}_acceptFriend`, {
                    ...noti._doc,
                    username: user.username,
                    thumbnail: user.thumbnail,
                  });
                }
              });
            }
          });
          const user = {
            iduser1: data.idUserOutGoing,
            iduser2: data.idUserInComing,
          };

          userFriends.create(user);
          res.json({ data });
        }
      }
    );
  }
  getNotifyAddFriend(req, res) {
    notify.find(
      { idUserInComing: req.query._u, Type: "ADD_FRIEND", isAccept: false },
      (error, data) => {
        if (!error) {
          if (data[0]) {
            const promise = new Promise((rejo, reje) => {
              let listNotify = [];
              data.forEach((dt) => {
                users.findById(dt.idUserOutGoing, (error, us) => {
                  if (!error) {
                    listNotify.push({
                      username: us.username,
                      thumbnail: us.thumbnail,
                      ...dt._doc,
                    });
                  }
                });
              });
              setTimeout(() => {
                rejo(listNotify);
              }, 300);
            });
            promise.then((data) => {
              res.json({ status: 200, notifys: data });
            });
          }
        }
      }
    );
  }
}

module.exports = new notifyController();
