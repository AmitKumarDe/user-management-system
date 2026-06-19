import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// User schema defines the structure of data stored in the users collection.
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  refreshToken: {
    type: String,
  },
});



// Pre-save middleware: hash the password before storing it in the database.
userSchema.pre("save", async function () {
  // Only hash the password if it is new or changed.
  if (!this.isModified("password")) return;

  // Hash password with bcrypt using 10 salt rounds.
  this.password = await bcrypt.hash(this.password, 10);
});

// Instance method to check whether the provided password matches the hashed password.
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate a short-lived access token containing user id and email.
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

// Generate a long-lived refresh token containing only the user id.
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

// Create and export the User model from the schema.
export const User = mongoose.model("User", userSchema);
