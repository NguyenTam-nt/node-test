const roomMessages = require("../Models/roomMessageModel");
const messages = require("../Models/messageModel");
const users = require("../Models/userModel");
const path = require("path");
const url = path.dirname(__dirname);

class messageController {
  getRoom(req, res) {
    const { _u } = req.query;
    roomMessages.find(
      { $or: [{ iduser1: _u }, { iduser2: _u }] },
      (error, rooms) => {
        if (!error) {
          const promise = new Promise((rejo, reject) => {
            const newRoom = [];
            rooms.forEach((ro) => {
              users.find(
                {
                  $or: [{ _id: ro.iduser1 }, { _id: ro.iduser2 }],
                  _id: { $ne: _u },
                },
                { _id: 0, username: 1, thumbnail: 1 },
                (error, user) => {
                  if (!error) {
                    messages.find({ idroom: ro._id }, (error, message) => {
                      if (!error) {
                        newRoom.push({
                          ...ro._doc,
                          user: { ...user[0]._doc },
                          mess: message.pop(),
                        });
                      }
                    });
                  }
                }
              );
            });
            setTimeout(() => rejo(newRoom), 700);
          });
          promise.then((data) => {
            res.json({ rooms: data });
          });
        }
      }
    );
  }
  createRoom(req, res) {
    const { _u, _cu } = req.body;
    const room = {
      iduser1: _u,
      iduser2: _cu,
    };
    if (_u) {
      users.findById(
        _u,
        { _id: 0, username: 1, thumbnail: 1 },
        (error, user) => {
          if (!error) {
            roomMessages.create(room, (error, newRoom) => {
              if (!error) {
                req.app.io.emit(`${_cu}_createRoom`, {
                  room: { ...newRoom._doc, user: { ...user._doc } },
                });
              }
            });
          }
        }
      );
    }
  }

  getMessage(req, res) {
    messages.find({ idroom: req.query._r }, (error, message) => {
      if (!error) {
        const messageOfRoom = { idroom: req.query._r, messages: [...message] };
        res.json({ messageOfRoom });
      }
    });
  }

  async addMessage(req, res) {
    const { idroom, iduser, message } = req.body;
    const arrayVideo = [
      "MP4",
      "MP3",
      "GIF",
      "MOV",
      "WMV",
      "HEVC",
      "AVI",
      "3GP",
    ];

    let urlImg, video;
    if (req.files) {
      const { file } = req.files;
      await arrayVideo.forEach(async (ext) => {
        if (ext === file.name.slice(-3).toUpperCase()) {
          video =
            (await file.md5) + Math.floor(Math.random() * 1000) + file.name;
          file.mv(`${url}/src/public/images/${video}`);
        }
      });
      if (!video) {
        urlImg =
          (await file.md5) + Math.floor(Math.random() * 1000) + file.name;
        file.mv(`${url}/src/public/images/${urlImg}`);
      }
    }

    messages.create(
      { idroom, iduser, message, image: urlImg, video },
      (error, data) => {
        if (!error) {
          req.app.io.emit(`${data.idroom}_sendMessage`, data);
          res.json({ data });
        }
      }
    );
  }
}

module.exports = new messageController();
