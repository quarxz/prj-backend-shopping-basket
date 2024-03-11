const Product = require("../models/Product");
const Category = require("../models/Category");

const connect = require("../lib/connect");

const getProducts = async (req, res) => {
  await connect();
  const products = await Product.find().populate("category");
  if (!products.length) {
    return res.status(400).json({ message: "Could not find any Products!" });
  }

  res.status(200).json(
    products.map((product) => ({
      ...product._doc,
      id: product._id,
      categorie_id: product.category.id,
      promoprice_10Percent: Number((product.price - (product.price / 100) * 10).toFixed(2)),
    }))
  );
};

const getProduct = async (req, res) => {
  await connect();
  const { productId } = req.params;

  try {
    const { _id } = (await Product.findOne({ _id: productId })) || {
      _id: null,
    };
    console.log(_id);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "This Product does not Exists!" });
  }

  const product = await Product.findOne({ _id: productId }).populate("category");

  if (!product) {
    return res.status(400).json({ message: "Could not find this Product!" });
  }
  // return res.status(200).json(product);

  res.status(200).json({
    ...product._doc,
    id: product._id,
    categorie_id: product.category.id,
    promoprice_10Percent: Number((product.price - (product.price / 100) * 10).toFixed(2)),
  });
};

module.exports = {
  getProducts,
  getProduct,
};
