const Product = require("../models/Product");
const Category = require("../models/Category");

const connect = require("../lib/connect");

const getCategories = async (req, res) => {
  await connect();
  const categories = await Category.find();
  if (!categories.length) {
    return res.status(400).json({ message: "Could not find any Categories!" });
  }

  res.status(200).json(
    categories.map((category) => ({
      ...category._doc,
      id: category._id,
    }))
  );
};

module.exports = {
  getCategories,
};
