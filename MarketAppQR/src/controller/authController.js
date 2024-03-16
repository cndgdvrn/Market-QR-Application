import crypto from "crypto";
import ErrorHandler from "../util/ErrorHandler.js";
import { User } from "../schema/userSchema.js";
import { HttpStatus } from "../util/Constants.js";
import { catchAsync, createAndSendToken } from "../util/Helpers.js";
import sendEmail from "../util/Email.js";

const authController = {
  /**
   ****************** Sign up ******************
   */
  signUp: catchAsync(async (req, res, next) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    createAndSendToken(newUser, HttpStatus.CREATED, res);
  }),

  /**
   ****************** Login ******************
   */
  login: catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password)
      return next(
        new ErrorHandler(
          "Please provide email and password",
          HttpStatus.BAD_REQUEST
        )
      );

    const user = await User.findOne({ email }).select("+password");

    //check if user exist then compare passwords
    if (!user || !(await user.comparePasswords(password, user.password))) {
      return next(
        new ErrorHandler(
          "Email or Password is incorrect",
          HttpStatus.UNAUTHORIZED
        )
      );
    }
    createAndSendToken(user, HttpStatus.OK, res);
  }),
  /**
   ****************** Forgot Password ******************
   */
  forgotPassword: catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return next(new ErrorHandler("Email not found", HttpStatus.NOT_FOUND));

    const resetToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    try {
      const resetURL = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/resetPassword/${resetToken}`;
      await sendEmail({
        email: user.email,
        subject: "Password reset",
        message: `Click here to reset your password: ${resetURL}`,
      });

      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new ErrorHandler(
          "There was an error while sending the email. Try again later!"
        ),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }),
  /**
   ****************** Reset Password ******************
   */
  resetPassword: catchAsync(async (req, res, next) => {
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new ErrorHandler(
          "Token is invalid or has expired",
          HttpStatus.BAD_REQUEST
        )
      );
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(HttpStatus.OK).json({
      status: "success",
    });
  }),
  /**
   ****************** Update Password ******************
   */
  updateMyPassword: catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    if (
      !(await user.comparePasswords(req.body.passwordCurrent, user.password))
    ) {
      return next(
        new ErrorHandler(
          "Your current password is wrong.",
          HttpStatus.UNAUTHORIZED
        )
      );
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createAndSendToken(user, HttpStatus.OK, res);
  }),
};

export default authController;
