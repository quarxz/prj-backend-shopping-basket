const Product = require("../models/Product");
const connect = require("../lib/connect");

const getProducts = async (req, res) => {
  await connect();
  const product = await Product.find();
  if (!product.length) {
    return res.status(400).json({ message: "Could not find any Products!" });
  }
  return res.status(200).json(product);
};

module.exports = {
  getProducts,
};
