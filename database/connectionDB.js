import mongoose from "mongoose";
import 'dotenv/config';

const DB_URL = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;

export const ConnectDB = async () => {
    try {
        await mongoose.connect(`${DB_URL}${DB_NAME}`)    
                      .then(()=>{console.log("Connect Database Successfully.")})
                      .catch((err)=>{console.log("Connection Err",err)})
    } catch (error) {
        console.log("Connection Err",error)
    }
}

export default mongoose;