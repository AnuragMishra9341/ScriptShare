
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validationResult } from "express-validator";
import { createUser } from "../utils/createUser.js";
import { User } from "../models/user.models.js";



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
       const user = await User.findOne({email})
       if(!user){
         throw new ApiError(404,'User not found');
       }
        const token = user.generateJWT();

        console.log(token);
      
    
    res.status(201).cookie("token",token,{httpOnly:true}).json(new ApiResponse(201,{user},'Logged In successfully'));
});

