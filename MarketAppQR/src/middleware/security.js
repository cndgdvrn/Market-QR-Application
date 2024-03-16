import { promisify } from "util";
import jwt from "jsonwebtoken";
import { HttpStatus } from "../util/Constants.js";
import ErrorHandler from "../util/ErrorHandler.js";
import { catchAsync, getTokenFromRequest } from "../util/Helpers.js";
import { User } from "../schema/userSchema.js";

const security = {
  protect: catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    const token = getTokenFromRequest(req);

    if (!token) {
      return next(
        new ErrorHandler(
          "You are not logged in! Please log in to get access.",
          HttpStatus.UNAUTHORIZED
        )
      );
    }
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new ErrorHandler(
          "The user belonging to this token does no longer exist.",
          HttpStatus.UNAUTHORIZED
        )
      );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new ErrorHandler(
          "User recently changed password! Please log in again.",
          HttpStatus.UNAUTHORIZED
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  }),
  restrictTo:
    (...roles) =>
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new ErrorHandler(
            "You do not have permission to perform this action",
            HttpStatus.FORBIDDEN
          )
        );
      }
      next();
    },
};

export default security;
