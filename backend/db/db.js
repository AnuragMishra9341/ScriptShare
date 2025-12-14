import mongoose from "mongoose";


 const connect = async ()=>{
    try {
        const response = await mongoose.connect(process.env.MONGODB_URL);
        if(response){
            console.log("MongoDB connected Successfully !!")
        }
    }

    catch (error){
       console.log('Mongodb error ',error);
    }
 }

 export default connect;