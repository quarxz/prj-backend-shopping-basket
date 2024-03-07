const mongoose = require("mongoose");

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: false },
    description: { type: String, required: false },
    timestamp: { type: Date, required: true },
    stock: { type: Number, required: false },
    price: { type: Number, required: false },
    top: { type: Boolean, required: false },
  },
  { versionKey: false }
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;
