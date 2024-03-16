import Jwt from "jsonwebtoken";

/**
 *
 * @param  req
 * @param  res
 * @param  next
 * @param  val
 * @returns
 */
export const checkID = (req, res, next, val) => {
  //TODO handle check id **
  if (req.params.id) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  }
  next();
};

/**
 *
 * @param fn wrapt it with a async function to avoid try catch everytime
 * @returns catches error if exists
 */
export const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

/**
 *
 * @param id to sign token with id
 * @returns  token
 */
export const createToken = (id, secret, expiresIn) => {
  const token = Jwt.sign({ id }, secret, { expiresIn });
  return token;
};

export const createAndSendToken = (user, statusCode, res) => {
  const token = createToken(
    user._id,
    process.env.JWT_SECRET,
    process.env.JWT_EXPIRES_IN
  );

  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};
/**
 *
 * @param  req request
 * @returns splits it and only returns token
 */
export const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    return authHeader.split(" ")[1];
  }
  // return req.cookies.jwt;
};

/**
 *
 * @param obj  req.body for generally
 * @param allowedFields only allowed fields that wanted to be inside body
 * @returns filtered obj
 */
export const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
