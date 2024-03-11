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
    promotion,
  } = (await User.findOne(userEmail === null ? { _id: user } : { email: userEmail })) || {
    _id: null,
    email: null,
    password: null,
    name: null,
    promotion: null,
  };

  if (!userId) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.status(200).json({ id: userId, email, password, name, promotion });
};

const activatePromotion = async (req, res) => {
  await connect();
  const { userId } = req.params;

  try {
    const { _id } = (await User.findOne({ _id: userId })) || { _id: null };
    console.log(_id);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "User does not exits!" });
  }

  console.log(userId);

  const { actionId } = req.body;
  console.log(actionId);

  if (userId && actionId) {
    const updateUser = await User.findByIdAndUpdate(
      { _id: userId },
      { $set: { promotion: true } },
      { returnNewDocument: true }
    );
    return res.status(200).json(updateUser);
  } else {
    return res.status(400).json({
      error: "User action not Updatet. UserId is missing!",
    });
  }

  return res.status(400).json({ message: "Couldn't delete book for user. User is missing!" });
};

module.exports = {
  getUsers,
  getUser,
  activatePromotion,
};
