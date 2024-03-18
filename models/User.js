const mongoose = require("mongoose");
const Product = require("./Product");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: { type: String, required: false },
    name: { type: String, required: false },
    password: { type: String, required: false },
    promotion: { type: Boolean, required: false },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: false },
      },
    ],
  },
  { versionKey: false }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
