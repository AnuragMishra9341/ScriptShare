import {User} from '../models/user.models.js'
export  const createUser = async({email,password})=>{
    if(!email || !password){
        throw new Error('Email and password are required');
    }
     
    const user = await User.create({
        email,
        password
    })

    // remove password field before returning
  const userObj = user.toObject();
  delete userObj.password;

  return userObj;
}