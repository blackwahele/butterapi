import mongoose from "mongoose";

//Define Schema - With Mongoose, everything is derived from a Schema.
const userWalletHistorySchema = new mongoose.Schema(
    {
        user_id : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : 'User'
        },
        prev_amount : {
            type : Number,
            required : true
        },
        amount : {
            type : Number,
            required : true
        },
        total_amount : {
            type : Number,
            required : true
        },
        wallet_type : { 
            type: String,  
            enum: ['credited', 'debited'], 
            required : true 
        },
        description : {
            type : String,
            required : true
        }         
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
const User_wallet_history = mongoose.models.user_wallet_histories || mongoose.model('User_wallet_history',userWalletHistorySchema);
export default User_wallet_history;