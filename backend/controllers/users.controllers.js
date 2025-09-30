
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
})