import { catchAsync, filterObj } from "../util/Helpers.js";
import { User } from "../schema/userSchema.js";
import { HttpStatus } from "../util/Constants.js";
import ErrorHandler from "../util/ErrorHandler.js";
import { getAll } from "./crudFactoryController.js";

const userController = {
  getAllUsers: getAll(User),

  deleteMe: catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(HttpStatus.NO_CONTENT).json({
      status: "succes",
      data: null,
    });
  }),
  updateMe: catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new ErrorHandler(
          "You cannot update your password here.",
          HttpStatus.BAD_REQUEST
        )
      );
    }
    const filteredBody = filterObj(req.body, "name", "email");

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(HttpStatus.OK).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  }),
};

export default userController;
