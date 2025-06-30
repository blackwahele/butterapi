import mongoose from "mongoose";

//Define Schema - With Mongoose, everything is derived from a Schema.
const currentSessionSchema = new mongoose.Schema(
    {
        current_session_id : {
            type : String,
            required : true
        }, 
        current_session_name : {
            type : String,
            required : true
        },   
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
        },
        status : { type: String,  enum: ['Active', 'Suspended'] },
        isdeleted : Boolean       
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
const Current_session = mongoose.models.current_sessions || mongoose.model('Current_session',currentSessionSchema);
export default Current_session;