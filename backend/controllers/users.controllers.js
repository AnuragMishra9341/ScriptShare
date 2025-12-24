
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

const isProd = process.env.NODE_ENV === "production";

// const options = {
//   httpOnly: true,
//   secure: isProd,                          // true in production (HTTPS required)
//   sameSite: isProd ? "none" : "lax",      // none in production for cross-site; lax locally
//   path: "/",
//   maxAge: 7 * 24 * 60 * 60 * 1000         // optional: 7 days
// };


const options = {
  httpOnly: true,
  secure: false,        // ✅ required for localhost (HTTP)
  sameSite: "lax",      // ✅ required for localhost
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000
};


export const otpController = asyncHandler(async (req,res)=>{
    const errors = validationResult(req);
      if(!errors.isEmpty()){
       
     return res.status(400).json({ errors: errors.array() });
      }

      const {email,password} = req.body;
      
       const otp = crypto.randomInt(100000, 1000000).toString();
       
      //  console.log(otp);
       if(!otp){
        throw new ApiError(400,'OTP cannot be created');
       }

       const user = await OTP.create({
         email,
         password,
         otp
       });
     
    if(!user){
        throw new ApiError(500,'OTP cannot be created');
    }

      await sendEmail(email, otp);
      
      const secret = user.generateJWT();

    res.status(200).cookie("secret",secret,options).json(new ApiResponse(200,'OTP sent successfully'));
});

export const signUpController = asyncHandler(async (req,res)=>{
  
      const { otp } = req.body;
     const token = req.cookies.secret;
           if(!token){
            throw new ApiError(401,'Token missing or invalid.');
           }
           const payload =  jwt.verify(token,process.env.JWT_SECRET);
           const email = payload.email;
      
       if(!otp){
           throw new ApiError(400,'OTP is missing ');
          }

       const info = await OTP.findOne({email}).sort({createdAt:-1});
         if(!info){
          throw new ApiError(400,"OTP entered is wrong");
         }

         if(info.otp != otp){
          throw new ApiError(400,'OTP entered is wrong');
         }
         
         const userDetail = {
           email : info.email,
           password : info.password
         }
         const userPresent = await User.findOne({email:info.email});
         if(userPresent){
          throw new  ApiError(409,'User is already present');
         }
       const user = await createUser(userDetail);
     
    if(!user){
        throw new ApiError(500,'user cannot be created');
    }

    res.status(201).json(new ApiResponse(201,user,'User created successfully'));
});

export const loginController = asyncHandler(async (req,res)=>{
    const errors = validationResult(req);
      if(!errors.isEmpty()){
       
     return res.status(400).json({ errors: errors.array() });
      }

      const {email,password} = req.body;
       const user = await User.findOne({email}).select('+password');
       if(!user){
         throw new ApiError(404,'User not found');
       }

       const isValidPassword = await user.isValidPassword(password);

       if(!isValidPassword){
        throw new ApiError(401,'password is not valid');
       }
        
        const token = user.generateJWT();
           const userObj = user.toObject();
            delete userObj.password; 
        console.log(token);
      
         
    res.status(200).cookie("token",token,options).json(new ApiResponse(200,{user: userObj},'Logged In successfully'));
});

export const findProjects = asyncHandler(async (req,res)=>{
   
   const user = req.user;
   const userId = user._id;
   

   const projects = await Project.find({users:userId}).sort({ createdAt: -1 });
  //  console.log(projects);
   res.status(200).json(new ApiResponse(200,projects,'user projects'));
});



