import mongoose from "mongoose";

//Define Schema - With Mongoose, everything is derived from a Schema.
const passResetOtpsSchema = new mongoose.Schema(
    {
        user_id : mongoose.Types.ObjectId, 
        otp_hash : String,       
        expires_at : Date, 
        token : String,      
        used : Boolean      
    },
    {
        timestamps: {
            createdAt: 'created_at', // to change createdAt name to created_at
            updatedAt: 'updated_at' // to change updatedAt name to updated_at
        }
    }
);

mongoose.models = {};

//compile shcema into model
/* 
 *   A model is a class with which we construct documents.
 *   In this case, each document will be a Card_master with properties and behaviors as declared in our schema. 
*/
const Password_reset_otp = mongoose.models.password_reset_otps || mongoose.model('Password_reset_otp',passResetOtpsSchema);
export default Password_reset_otp;