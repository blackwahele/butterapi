import mongoose from "mongoose";

//Define Schema - With Mongoose, everything is derived from a Schema.
const stateMasterSchema = new mongoose.Schema(
    {
        sid : Number,
        name : String, 
        shortName : String,
        countryid : Number,       
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
const State = mongoose.models.states || mongoose.model('State',stateMasterSchema);
export default State;