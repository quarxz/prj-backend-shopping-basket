const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: { type: String, required: false },
    name: { type: String, required: false },
    password: { type: String, required: false },
    books: [{ type: Schema.Types.ObjectId, ref: "Book" }],
  },
  { versionKey: false }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
