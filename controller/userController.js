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

  const product = (
    await User.findOne(userEmail === null ? { _id: user } : { email: userEmail })
  ).populate({
    path: "products",
    populate: { path: "productId", model: "Product" },
  });

  // if (!userId) {
  //   return res.status(404).json({ message: "User not found" });
  // }

  // return res.status(200).json({ id: userId, email, password, name, promotion, products });
  return res.status(200).json(product);
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

const userByProduct = async (req, res) => {
  await connect();
  const { userId } = req.params;

  try {
    const user = await User.findOne({ _id: userId });

    const { productId, quantity } = req.body;

    if (user && productId) {
      const { _id: isProductExists } = (await Product.findOne({ _id: productId })) || { _id: null };

      if (user.products.length) {
        for (let i = 0; i < user.products.length; i++) {
          let el = user.products[i].productId;
          if (el.toString() === isProductExists.toString()) {
            return res.status(400).json({ message: "Produkt already in basket!" });
          }
        }
      }

      const product = await Product.findOne({ _id: productId });

      if (product.stock === 0) {
        return res.status(400).json({ message: "Product is out of Stock!" });
      }
      if (product.stock < quantity) {
        return res
          .status(400)
          .json({ message: "There are only " + product.stock + " left in stock" });
      }
      if (product.stock > 0) {
        const productStockUpdate = await Product.findByIdAndUpdate(
          { _id: productId },
          { $inc: { stock: -quantity } }
        );
      }

      const updateUser = await User.findByIdAndUpdate(
        userId,
        { $push: { products: { productId: productId, quantity: quantity } } },
        { returnDocument: "after" }
      );

      return res.status(200).json(updateUser);
    } else {
      return res.status(400).json({
        message: "Product NOT added. Product Id and/or User id is missing!",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "Could not find user!" });
  }
};

const userDeleteProduct = async (req, res) => {
  await connect();
  const { userId } = req.params;

  try {
    const user = await User.findOne({ _id: userId });

    const { productId, quantity } = req.body;
    console.log(quantity);

    if (user && productId) {
      const { _id: isProductExists } = (await Product.findOne({ _id: productId })) || { _id: null };

      // const product = await Product.findOne({ _id: productId });

      // if (user.products.length) {
      //   user.products.map(async (product) => {
      //     if (product.toString() === isProductExists.toString()) {
      //       if (quantity > el.quantity) {
      //         return res.status(400).json({ message: "Max to delete: " + el.quantity });
      //       }
      //     }
      //   });
      // }

      const productStockUpdate = await Product.findByIdAndUpdate(
        { _id: productId },
        { $inc: { stock: +quantity } }
      );

      // const updateUserProduct02 = user.products.map((product) =>
      //   product.productId === productId ? { ...product, quantity: product.quantity - 2 } : product
      // );
      // console.log(updateUserProduct02);

      // const updateUserProduct02 = user.products.map((product) =>
      //   product.productId.toString() === productId.toString() ? product.quantity : ""
      // );
      // console.log("x", updateUserProduct02.filter(Number));

      // const { products } = await User.findByIdAndUpdate({ _id: userId });
      // console.log(products);
      // const updateUser = await User.find({ userId: userId });

      user.products.map(async (product) => {
        if (product.productId.toString() === productId.toString()) {
          console.log(product.productId.toString());
          console.log(productId.toString());
          if (product.quantity >= 1) {
            // Update if basket quantity > want to delete quantity
            const updateUserProduct = await User.findOneAndUpdate(
              { _id: userId },
              { $inc: { "products.$[filter].quantity": -quantity } },
              { arrayFilters: [{ "filter.productId": productId }] },
              { returnNewDocument: true }
            );

            // Update if basket quantity = 0 after want to delete
            // komplett löschen
            const { products } = await User.findOne({ _id: userId });
            products.map(async (product) => {
              if (product.productId.toString() === productId.toString()) {
                if (product.quantity < 1) {
                  const updateUser = await User.findByIdAndUpdate(
                    userId,
                    { $pull: { products: { productId: productId } } },
                    { returnNewDocument: true }
                  );
                  console.log("Delete complete: ", productId);
                }
              }
            });
          }
          const updatedUser = await User.findOne({ _id: userId });
          console.log("#2:", updatedUser.products);
          return res.status(200).json(updatedUser);
        }
      });
    } else {
      return res.status(400).json({
        message: "Product NOT deleted. Product Id and/or User id is missing!",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "Could not find user!" });
  }
};

module.exports = {
  getUsers,
  getUser,
  activatePromotion,
  deactivatePromotion,
  userByProduct,
  userDeleteProduct,
};
