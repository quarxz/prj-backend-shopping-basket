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
  try {
    const { user: userId } = req.params;
    await connect();
    const userEmail = userId.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);

    const criteria = userEmail ? { email: userEmail } : { _id: userId };

    const user = await User.findOne(criteria).populate("products.product");

    // return res.status(200).json({ id: userId, email, password, name, promotion, products });
    const arr = Array();
    let basket_total = 0;
    user.products.map((item) => {
      const product_total = item.product.price * item.quantity;
      arr.push(product_total);
      basket_total = arr.reduce((acc, curr) => {
        return acc + curr;
      }, 0);
    });

    const { _id, products, ...rest } = user._doc;
    // console.log(
    //   user._doc.products.map((item) => {
    //     return { ...item._doc, quantity: item.quantity };
    //   })
    // );
    return res.status(200).json({
      ...rest,
      id: _id,
      basket_total: basket_total,
      basket_total_discount: user.promotion ? (basket_total / 100) * 10 : 0,
      basket_total_promotion: user.promotion ? basket_total - (basket_total / 100) * 10 : 0,
      products: products.map((cartItem) => {
        console.log(cartItem._doc.product.price);
        return {
          ...cartItem._doc,
          quantity: cartItem.quantity,
          product_total: cartItem.quantity * cartItem._doc.product.price,
        };
      }),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "User not found!" });
  }
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

const userAddProduct = async (req, res) => {
  await connect();
  const { userId } = req.params;

  try {
    const user = await User.findOne({ _id: userId });

    const { productId, quantity } = req.body;

    if (user && productId) {
      const { _id: isProductExists } = (await Product.findOne({
        _id: productId,
      })) || { _id: null };

      const product = await Product.findOne({ _id: productId });

      if (product.stock === 0) {
        return res.status(400).json({ message: "Product is out of Stock!" });
      }
      if (product.stock < quantity) {
        return res.status(400).json({
          message: "There are only " + product.stock + " left in stock",
        });
      }
      if (product.stock > 0) {
        const productStockUpdate = await Product.findByIdAndUpdate(
          { _id: productId },
          { $inc: { stock: -quantity } }
        );
      }

      if (user.products.length) {
        for (let i = 0; i < user.products.length; i++) {
          let el = user.products[i].product;
          // if (el.toString() === isProductExists.toString()) {
          if (el.equals(isProductExists)) {
            const updateUserProduct = await User.findOneAndUpdate(
              { _id: userId },
              { $inc: { "products.$[filter].quantity": +quantity } },
              { arrayFilters: [{ "filter.product": productId }] },
              { returnNewDocument: true }
            );

            // return res.status(400).json({ message: "Produkt already in basket!" });
            return res.status(200).json({ message: "Produkt is updated in basket!" });
          }
        }
      }

      const updateUser = await User.findByIdAndUpdate(
        userId,
        { $push: { products: { product: productId, quantity: quantity } } },
        { returnDocument: "after" }
      );

      return res.status(200).json({ message: "Product has been added!" });
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
      const { _id: isProductExists } = (await Product.findOne({
        _id: productId,
      })) || { _id: null };

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
        // if (product.product.toString() === productId.toString()) {
        if (product.product.equals(productId)) {
          console.log(product.product.toString());
          console.log(productId.toString());

          if (product.quantity >= 1) {
            console.log(product.quantity);
            // Update if basket quantity > want to delete quantity
            const updateUserProduct = await User.findOneAndUpdate(
              { _id: userId },
              { $inc: { "products.$[filter].quantity": -quantity } },
              { arrayFilters: [{ "filter.product": productId }] },
              { returnNewDocument: true }
            );

            // Update if basket quantity = 0 after want to delete
            // komplett löschen
            const { products } = await User.findOne({ _id: userId });
            products.map(async (product) => {
              // if (product.product.toString() === productId.toString()) {
              if (product.product.equals(productId)) {
                if (product.quantity < 1 || product.quantity === 0) {
                  const updateUser = await User.findByIdAndUpdate(
                    userId,
                    { $pull: { products: { product: productId } } },
                    { returnNewDocument: true }
                  );
                  console.log("Delete complete: ", productId);
                }
              }
            });
          }
          const updatedUser = await User.findOne({ _id: userId }).populate("products.product");
          console.log("#2:", updatedUser.products);

          const arr = Array();
          let basket_total = 0;
          updatedUser.products.map((item) => {
            const product_total = item.product.price * item.quantity;
            arr.push(product_total);
            basket_total = arr.reduce((acc, curr) => {
              return acc + curr;
            }, 0);
          });

          const { ...rest } = updatedUser._doc;
          return res
            .status(200)
            .json({ ...rest, basket_total, message: "Product has been deleted!" });
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
  userAddProduct,
  userDeleteProduct,
};
