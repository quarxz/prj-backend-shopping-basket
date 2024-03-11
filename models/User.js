const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: { type: String, required: false },
    name: { type: String, required: false },
    password: { type: String, required: false },
    promotion: { type: Boolean, required: false },
  },
  { versionKey: false }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
