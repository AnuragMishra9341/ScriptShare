import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validationResult } from "express-validator";
import { createUser } from "../utils/createUser.js";
import { User } from "../models/user.models.js";
import Project from "../models/project.models.js";
import mongoose from "mongoose";
import crypto from "crypto";
import { OTP } from "../models/otp.models.js";
import { sendEmail } from "../utils/Email.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const isProd = process.env.NODE_ENV === "production";

const generateOTP = () => {
  const otp = crypto.randomInt(100000, 1000000).toString();
  return otp;
};

const options = {
  httpOnly: true,
  secure: isProd,                          // true in production (HTTPS required)
  sameSite: isProd ? "none" : "lax",      // none in production for cross-site; lax locally
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000         // optional: 7 days
};

// const options = {
//   httpOnly: true,
//   secure: false, // ✅ required for localhost (HTTP)
//   sameSite: "lax", // ✅ required for localhost
//   path: "/",
//   maxAge: 7 * 24 * 60 * 60 * 1000,
// };

export const forgotPasswordController = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const userExists = await User.exists({ email });
  if (!userExists) {
    throw new ApiError(404, "User not found");
  }

  const otp = generateOTP();
   if(!otp){
    throw new ApiError(500,"otp cannot be generated");
   }
  //  console.log(otp);
  const forgotToken = jwt.sign(
    { email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  if(!forgotToken ){
    throw new ApiError(401,'token is missing');
  }

  await OTP.create({
    email,
    otp,
  
  });

   const rp = await sendEmail(email, otp);

  //  console.log(rp);

  res
    .status(200)
    .cookie("forgotToken", forgotToken, options)
    .json(new ApiResponse(200, null, "OTP sent successfully"));
});


export const updatePasswordController = asyncHandler(async (req, res) => {
  const token = req.cookies.forgotToken;
  if (!token) {
    throw new ApiError(401, "Token missing or Invalid");
  }
  const { password, otp } = req.body;
  if (!password) {
    throw new ApiError(401, "Password is required");
  }
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const email = payload.email;

  // find otp mapped with this email
  const otpResponse = await OTP.findOne({ email }).sort({ createdAt: -1 });

  if (!otpResponse) {
    throw new ApiError(
      404,
      "updation request is not initiated for this account"
    );
  }
  if (otp != otpResponse.otp) {
    throw new ApiError(401, "OTP is not valid");
  }

  // upadte the password but first hash it
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.password = hashedPassword; 
  await user.save();
  res.status(200).json(new ApiResponse(200,null,"password reset successfully"));
});

export const otpController = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const otp = generateOTP();

  //  console.log(otp);
  if (!otp) {
    throw new ApiError(500, "OTP cannot be created");
  }

  const user = await OTP.create({
    email,
    password,
    otp,
  });

  if (!user) {
    throw new ApiError(500, "OTP cannot be created");
  }

  await sendEmail(email, otp);

  const secret = user.generateJWT();

  res
    .status(200)
    .cookie("secret", secret, options)
    .json(new ApiResponse(200, null, "OTP sent successfully"));
});

export const signUpController = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const token = req.cookies.secret;
  if (!token) {
    throw new ApiError(401, "Token missing or invalid.");
  }
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const email = payload.email;

  if (!otp) {
    throw new ApiError(400, "OTP is missing ");
  }

  const info = await OTP.findOne({ email }).sort({ createdAt: -1 });
  if (!info) {
    throw new ApiError(400, "OTP entered is wrong");
  }

  if (info.otp != otp) {
    throw new ApiError(400, "OTP entered is wrong");
  }

  const userDetail = {
    email: info.email,
    password: info.password,
  };
  const userPresent = await User.findOne({ email: info.email });
  if (userPresent) {
    throw new ApiError(409, "User is already present");
  }
  const user = await createUser(userDetail);

  if (!user) {
    throw new ApiError(500, "user cannot be created");
  }

  res.status(201).json(new ApiResponse(201, user, "User created successfully"));
});

export const loginController = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isValidPassword = await user.isValidPassword(password);

  if (!isValidPassword) {
    throw new ApiError(401, "password is not valid");
  }

  const token = user.generateJWT();
  const userObj = user.toObject();
  delete userObj.password;
  // console.log(token);

  res
    .status(200)
    .cookie("token", token, options)
    .json(new ApiResponse(200, { user: userObj }, "Logged In successfully"));
});

export const findProjects = asyncHandler(async (req, res) => {
  const user = req.user;
  const userId = user._id;

  const projects = await Project.find({ users: userId }).sort({
    createdAt: -1,
  });
  //  console.log(projects);
  res.status(200).json(new ApiResponse(200, projects, "user projects"));
});
