import mongoose from "mongoose";

//Define Schema - With Mongoose, everything is derived from a Schema.
const oldBetByUserSchema = new mongoose.Schema(
    {
        old_id : {
            type : mongoose.Schema.Types.ObjectId,
            required : true
        },
        current_session_id : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : 'Current_session'
        },
        user_id : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : 'User'
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
const Old_bet_by_user = mongoose.models.old_bet_by_users || mongoose.model('Old_bet_by_user',oldBetByUserSchema);
export default Old_bet_by_user;