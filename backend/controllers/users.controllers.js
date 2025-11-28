
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validationResult } from "express-validator";
import { createUser } from "../utils/createUser.js";
import { User } from "../models/user.models.js";
import Project from "../models/project.models.js";
import mongoose from "mongoose";
const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,                          // true in production (HTTPS required)
  sameSite: isProd ? "none" : "lax",      // none in production for cross-site; lax locally
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000         // optional: 7 days
};


export const signUpController = asyncHandler(async (req,res)=>{
      const errors = validationResult(req);
      if(!errors.isEmpty()){
       
     return res.status(400).json({ errors: errors.array() });
      }

      const {email,password} = req.body;
       const response = await User.findOne({email})
       if(response){
         throw new ApiError(400,'User already exists');
       }
       const user = await createUser(req.body);
     
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



