const User = require("../models/User");
const Product = require("../models/Product");

const connect = require("../lib/connect");

const getUsers = async (req, res) => {
  await connect();
  const users = await User.find();

  if (!users.length) {
    return res.status(404).json({ message: "Users not found" });
  }

  // return res.json(notes.map((note) => ({ ...note._doc, id: note._id })));
  return res.status(200).json(users);
};

const getUser = async (req, res) => {
  await connect();
  const { user } = req.params;
  const userEmail = user.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);

  const {
    _id: userId,
    email,
    password,
    name,
  } = (await User.findOne(userEmail === null ? { _id: user } : { email: userEmail })) || {
    _id: null,
    email: null,
    password: null,
    name: null,
  };

  if (!userId) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.status(200).json({ id: userId, email, password, name });
};

module.exports = {
  getUsers,
  getUser,
};
