const mongoose = require("mongoose");

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    title: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    description: { type: String, required: false },
    timestamp: { type: Date, required: true },
    stock: { type: Number, required: false },
    price: { type: Number, required: false },
    top: { type: Boolean, required: false },
    image: { url: { type: String }, alt: { type: String } },
  },
  { versionKey: false }
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;
