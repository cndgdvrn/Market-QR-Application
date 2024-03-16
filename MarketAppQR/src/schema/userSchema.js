import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Roles } from "../util/Constants.js";

export const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name required"],
  },
  email: {
    type: String,
    required: [true, "Please provide your Email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid Email"],
  },
  role: {
    type: String,
    enum: Object.values(Roles),
    default: Roles.User,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 6,
    maxlength: 15,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords do not match",
    },
  },
  passwordChangedAt: Number,
  passwordResetToken: String,
  passwordResetExpires: Number,
  responsibleMarkets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Market",
      select: false,
    },
  ],
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//      ********** MIDDLEWARES **********

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

//      ********** METHODS **********

/**
 * @param candidate posted password
 * @param actual acutal password
 * @returns boolean
 */
userSchema.methods.comparePasswords = async function (candidate, actual) {
  return await bcrypt.compare(candidate, actual);
};

/**
 * @param JWTTimestamp timestampt /1000 which JWT creates
 * @returns boolean
 */
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false; // False means NOT changed
};

/**
 * @returns reset token
 */
userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  // eslint-disable-next-line prettier/prettier
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export const User = mongoose.model("User", userSchema);
