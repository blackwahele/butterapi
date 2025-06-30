import mongoose from "mongoose";

//Define Schema - With Mongoose, everything is derived from a Schema.
const currentCardRevealTimeSchema = new mongoose.Schema(
    {       
        startTime : {
            type : Date,
            required : true
        },
        endTime : {
            type : Date,
            required : true
        },
        startBy : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : 'User'
        }, 
        endBy : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User'
        },
        isActive : {
            type : Boolean,
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
const Current_card_reveal_time = mongoose.models.current_card_reveal_times || mongoose.model('Current_card_reveal_time',currentCardRevealTimeSchema);
export default Current_card_reveal_time;