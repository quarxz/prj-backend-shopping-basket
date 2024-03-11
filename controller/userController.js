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
    const { _id: id } = (await User.findOne({ _id: userId })) || { _id: null };
    console.log(id);

    const { actionId } = req.body;
    console.log(actionId);

    if (id && actionId) {
      const updateUser = await User.findByIdAndUpdate(
        { _id: id },
        { $set: { promotion: true } },
        { returnDocument: "after" }
      );
      return res.status(200).json(updateUser);
    } else {
      return res.status(400).json({
        error: "User action not Updatet. UserId is missing!",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "User does not exits!" });
  }
};

const deactivatePromotion = async (req, res) => {
  await connect();
  const { userId } = req.params;

  try {
    const { _id: id } = (await User.findOne({ _id: userId })) || { _id: null };
    console.log(id);

    const { actionId } = req.body;
    console.log(actionId);

    if (id && actionId) {
      const updateUser = await User.findByIdAndUpdate(
        { _id: id },
        { $set: { promotion: false } },
        { returnDocument: "after" }
      );
      return res.status(200).json(updateUser);
    } else {
      return res.status(400).json({
        error: "User action not Updatet. UserId is missing!",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "User does not exits!" });
  }
};

module.exports = {
  getUsers,
  getUser,
  activatePromotion,
  deactivatePromotion,
};
