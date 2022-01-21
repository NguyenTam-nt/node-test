const post = require("../Models/postModel");
const followers = require("../Models/followerModel");
const user_friend = require("../Models/userFriend");

const users = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const url = path.join(__dirname, "../");

class homeController {
  getPosts(req, res, next) {
    user_friend.find(
      { $or: [{ iduser1: req.data._id }, { iduser2: req.data._id }] },
      { iduser1: 1, iduser2: 1 },
      async (error, data) => {
        //get list include crruser, friends

        const newUsers = await data.reduce((cur, us) => {
          return cur.concat(us.iduser1, us.iduser2);
        }, []);

        const newArray = await Array.from(new Set(newUsers));

        const postAll = await post
          .find({ userid: { $in: newArray } })
          .skip(parseInt(req.query.skip))
          .limit(parseInt(req.query.limit))
          .sort({ create_at: -1 });

        if (!postAll[0]) res.json({ status: 200, posts: null });

        const newPostAll = postAll.map(async (pos, index) => {
          //get user comment;
          const listCommentNew = [];
          const commentUser = pos.comments.map(async (post) => {
            const userCom = await users.findById(post.iduser, {
              _id: 0,
              username: 1,
              thumbnail: 1,
            });

            listCommentNew.push({
              ...post._doc,
              ...userCom._doc,
            });
          });

          //get user up Posts
          const userPost = await users.findById(pos.userid, {
            _id: 0,
            username: 1,
            thumbnail: 1,
          });

          await Promise.all(commentUser);

          return {
            ...pos._doc,
            ...userPost._doc,
            comments: listCommentNew,
          };
        });

        Promise.all(newPostAll).then((data) => {
          res.json({ posts: data, status: 200 });
        });
      }
    );
  }

  async accepToken(req, res, next) {
    const promise = new Promise((rejo, reje) => {
      const authorizationHeader =
        req.headers["authorization"] && req.headers["authorization"];
      if (authorizationHeader) {
        rejo(authorizationHeader);
      }
    });

    try {
      promise.then((authorizationHeader) => {
        const token = authorizationHeader.split(" ")[1];
        if (!token) res.json({ status: 401 });
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, data) => {
          if (error) res.json({ status: 403 });

          users.findOne({ email: data.email }).then((data) => {
            req.data = data;
            next();
          });
        });
      });
    } catch (error) {}
  }

  //addposst

  async addPost(req, res, next) {
    // console.log(req.files, req.body);
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
    const thumbnail = req.files.thumbnail;
    let urlvideo = "";
    let img = "";

    await arrayVideo.forEach(async (video) => {
      if (video === thumbnail.name.slice(-3).toUpperCase()) {
        urlvideo =
          (await thumbnail.md5) +
          Math.floor(Math.random() * 1000) +
          thumbnail.name;
        thumbnail.mv(`${url}/src/public/images/${urlvideo}`);
        return;
      }
    });

    if (urlvideo === "") {
      img = thumbnail.md5 + Math.floor(Math.random() * 1000) + thumbnail.name;
      thumbnail.mv(`${url}/src/public/images/${img}`);
    }

    const po = {
      userid: req.data._id,
      video: urlvideo,
      image: img,
      isPublic: req.body.isPublic,
      content: req.body.content,
    };

    post.create(po, (error, data) => {
      if (!error) {
        users.findById(
          data.userid,
          { _id: 0, username: 1, thumbnail: 1 },
          (error, doc) => {
            if (!error) {
              res.json({ data: { ...data._doc, ...doc._doc } });
            }
          }
        );
      }
    });
  }

  async updatePost(req, res) {
    const { _id, content, isPublic } = req.body;
    const pt = await post.findById(_id);
    let urlImage = pt.image;
    let urlVideo = pt.video;
    if (req.files) {
      if (req.files.image) {
        const { image } = req.files;
        urlImage = image.md5 + Math.floor(Math.random() * 1000) + image.name;
        image.mv(`${url}/src/public/images/${urlImage}`);
        // const fileName =
        pt.image && fs.unlinkSync(`${url}src\\public\\images\\${pt.image}`);
      }

      if (req.files.video) {
        const { video } = req.files;
        urlVideo = video.md5 + Math.floor(Math.random() * 1000) + video.name;
        video.mv(`${url}/src/public/images/${urlVideo}`);
        // const fileName =
        pt.video && fs.unlinkSync(`${url}src\\public\\images\\${pt.video}`);
      }
    }

    pt.content = content;
    pt.image = urlImage;
    pt.video = urlVideo;
    pt.isPublic = isPublic;
    pt.save();
    req.app.io.emit(`${pt._id}_update_post`, pt);
  }

  async likePost(req, res) {
    const posts = await post.findById(req.body.idpost);

    const check = await posts.liked.some((id) => id === req.body.iduser);

    if (check) {
      posts.liked = posts.liked.filter((id) => id !== req.body.iduser);
      posts.save();

      req.app.io.emit(req.body.idpost + "_like", {
        isLike: false,
        data: {
          idpost: req.body.idpost,
          iduser: req.body.iduser,
        },
      });
      res.json({
        isLike: false,
        data: {
          idpost: req.body.idpost,
          iduser: req.body.iduser,
        },
      });
      console.log("unlike");
    } else {
      posts.liked.push(req.body.iduser);
      posts.save();

      req.app.io.emit(req.body.idpost + "_like", {
        isLike: true,
        data: {
          idpost: req.body.idpost,
          iduser: req.body.iduser,
        },
      });

      res.json({
        isLike: true,
        data: {
          idpost: req.body.idpost,
          iduser: req.body.iduser,
        },
      });
      console.log("like");
    }
  }

  getCrUserLikePost(req, res) {
    users.find({ email: req.data.email }, (error, user) => {
      if (!error && user[0]) {
        const user_friend_cur_user = [];
        const follower_get = new Promise((resolve, reject) => {
          followers.find({ iduserfollow: user._id }, (error, flowers) => {
            if (error) {
              reject([]);
            } else {
              resolve(flowers.iduserisfollow);
            }
          });
        });

        const frienduser_get = new Promise((resolve, reject) => {
          user_friend
            .find(
              { $or: [{ iduser2: user._id, iduser1: user._id }] },
              (error, userfriends) => {
                if (error) {
                  reject([]);
                } else {
                  resolve(userfriends.join(","));
                }
              }
            )
            .pretty();
        });

        Promise.all([follower_get, frienduser_get]).then((us) => {
          user_friend_cur_user = [...us, user.id];
          users.find({ id: { $in: user_friend_cur_user } }, (error, data) => {
            if (!error) {
              res.json({ data });
            }
          });
        });
      }
    });
  }

  async addComment(req, res) {
    const postContent = await post.findById(req.body.idpost);

    users.find(
      { _id: req.body.iduser },
      { _id: 0, username: 1, thumbnail: 1 },
      async (error, user) => {
        if (!error) {
          const comment = await {
            iduser: req.body.iduser,
            comment: req.body.comment,
          };
          postContent.comments.unshift(comment);
          await postContent.save();
          const cmt = await postContent.comments.shift();

          req.app.io.emit(req.body.idpost + "_comment", {
            ...cmt._doc,
            ...user[0]._doc,
          });

          res.json({
            status: 200,
          });
        }
      }
    );
  }

  getUserNoFriend() {}

  deletePost(req, res) {
    post.findOneAndDelete({ _id: req.body.idpost }, (error, doc) => {
      if (!error) {
        fs.unlinkSync(`${url}src\\public\\images\\${doc.image}`);
        req.app.io.emit(`${doc._id}_deletePostSuccess`, { idpost: doc._id });
      }
    });
  }

  getPostOfCurrent(req, res) {
    const { name, skip, limit } = req.query;

    users.find(
      { username: name },
      { password: 0, token: 0 },
      async (error, data) => {
        if (!error) {
          //get list include crruser, friends
          try {
            const postAll = await post
              .find({ userid: data[0]._id })
              .skip(parseInt(skip))
              .limit(parseInt(limit))
              .sort({ create_at: -1 });

            //get user up Posts
            const newPostAll = await postAll.map(async (pos, index) => {
              const listComment = [];
              const promise = await pos.comments.map(async (post) => {
                const user = await users.findById(post.iduser, {
                  username: 1,
                  thumbnail: 1,
                });
                listComment.push({
                  ...post._doc,
                  ...user._doc,
                });
              });

              //await get user comment complete
              await Promise.all(promise);

              return {
                ...data[0]._doc,
                ...pos._doc,
                comments: listComment,
              };
            });

            //complete get posts
            Promise.all(newPostAll).then((newPostAll) => {
              res.json({ posts: newPostAll, user: data[0] });
            });
          } catch (error) {}
        }
      }
    );
  }

  getImageOfUser(req, res) {
    const iduser = req.query._u;
    post.find(
      { userid: iduser },
      { image: 1, video: 1 },
      async (error, data) => {
        if (!error) {
          const listImage = await data.map((post) => ({
            _id: post._id,
            image: post.image,
          }));
          const listVideo = await data.map((post) => ({
            _id: post._id,
            video: post.video,
          }));

          res.json({ listImage, listVideo });
        }
      }
    );
  }

  async searchPost(req, res) {
    const { keyword } = req.query;
    const listPostContent = await post.find({
      content: { $regex: keyword, $options: "i" },
    });

    const listPost = await post.find();

    const listPostSearch = await listPost.map(async (post) => {
      const postComment = await post.comments.some((cmt) => {
        return cmt.comment.includes(keyword);
      });

      return postComment ? post : null;
    });

    Promise.all(listPostSearch).then((listpostcmt) => {
      const listAll = [...listPostContent, ...listpostcmt];
      const newPostall = listAll.filter((post) => post !== null);
      res.json({ newPostall });
    });
  }
}

module.exports = new homeController();
