const mongoose = require("mongoose");

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
  },
  { versionKey: false }
);

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

module.exports = Category;
