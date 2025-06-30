import mongoose from "mongoose";

//Define Schema - With Mongoose, everything is derived from a Schema.
const nextGameStartInSchema = new mongoose.Schema(
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
const Next_game_start_in = mongoose.models.next_game_start_in || mongoose.model('Next_game_start_in',nextGameStartInSchema);
export default Next_game_start_in;