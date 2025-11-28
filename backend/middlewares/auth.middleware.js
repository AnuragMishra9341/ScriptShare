import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import  {ApiError} from "../utils/ApiError.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

  export const authMiddleware = asyncHandler(async (req,res,next)=>{
      const token = req.cookies.token;
      if(!token){
       throw new ApiError(401,'Token missing or invalid.');
      }
      const payload =  jwt.verify(token,process.env.JWT_SECRET);
      const email = payload.email;
      const user =await User.findOne({email});
      if(!user){
         throw new ApiError(404,'User not found');
      }
      req.user = user;
      next();
  })

