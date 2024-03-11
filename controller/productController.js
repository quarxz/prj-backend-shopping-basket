const Product = require("../models/Product");
const connect = require("../lib/connect");

const getProducts = async (req, res) => {
  await connect();
  const products = await Product.find();
  if (!products.length) {
    return res.status(400).json({ message: "Could not find any Products!" });
  }

  res.status(200).json(products.map((product) => ({ ...product._doc, id: product._id })));
};

const getProduct = async (req, res) => {
  await connect();
  const { productId } = req.params;

  try {
    const { _id } = (await Product.findOne({ _id: productId })) || { _id: null };
    console.log(_id);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "This Product does not Exists!" });
  }

  const product = (await Product.findOne({ _id: productId })) || { _id: null };

  if (!product) {
    return res.status(400).json({ message: "Could not find this Product!" });
  }
  return res.status(200).json(product);
};

module.exports = {
  getProducts,
  getProduct,
};
