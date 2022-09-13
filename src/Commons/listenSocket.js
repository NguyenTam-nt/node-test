const userFriend = require("../../Models/userFriend");
const user = require("../../Models/userModel");
const posts = require("../../Models/postModel");

function listenSocket(io) {
  io.on("connection", (socket) => {
    // console.log(socket.id);
    socket.on("login_success", async (data) => {
      socket.userid = data?._id; 

      const currenUser = await user.findById(data._id, {
        username: 1,
        thumbnail: 1, 
        status: 1,
      });

      if(currenUser !== null) {
        console.log(currenUser)
        // currenUser?.status = true;
        await currenUser.save();
        const listUser = await userFriend.find({
          $or: [{ iduser1: data._id }, { iduser2: data._id }],
        });
  
        //user join room friends
        listUser.forEach((roomFriend) => socket.join(`room_${roomFriend._id}`));
  
        //get id userfriend
        const newIduser = await listUser.map((userid) =>
          userid.iduser1 === data._id ? userid.iduser2 : userid.iduser1
        );
  
        //get user friends is online
        user.find(
          { _id: { $in: newIduser }, status: true },
          { username: 1, thumbnail: 1 },
          (error, data) => {
            if (!error) {
              socket.emit("get_user_online", data);
            }
          }
        );
  
        //report current user is online to friends
        listUser.forEach((user) => {
          socket.broadcast
            .to(`room_${user._id}`)
            .emit("user_had_online", currenUser);
        });
        //   console.log(io.sockets.adapter.rooms);
  
        socket.on("log_out", (data) => {
          user.updateOne(
            { _id: socket.userid },
            { $set: { status: false } },
            (error, data) => {
              if (!error) {
                listUser.forEach((user) => {
                  socket.broadcast
                    .to(`room_${user._id}`)
                    .emit("user_had_offline", socket.userid);
                });
              }
            }
          );
        });
  
        socket.on("disconnect", () => {
          user.updateOne(
            { _id: socket.userid },
            { $set: { status: false } },
            (error, data) => {
              if (!error) {
                listUser.forEach((user) => {
                  socket.broadcast
                    .to(`room_${user._id}`)
                    .emit("user_had_offline", socket.userid);
                });
              }
            }
          );
        });
      

      }

    });

    socket.on("get_current_post", async (data) => {
      const post = await posts.findById(data);

      const listComment = [];
      const promise = await post.comments.map(async (post) => {
        const userComment = await user.findById(post.iduser, {
          username: 1,
          thumbnail: 1,
        });
        listComment.push({
          ...post._doc,
          ...userComment._doc,
        });
      });

      //await get user comment complete
      await Promise.all(promise);

      const userPost = await user.findById(post.userid, {
        _id: 0,
        username: 1,
        thumbnail: 1,
      });

      socket.emit("get_post_success", {
        ...post._doc,
        ...userPost._doc,
        comments: listComment,
      });
    });
  });
}

module.exports = listenSocket;
