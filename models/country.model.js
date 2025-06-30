import mongoose from "mongoose";

//Define Schema - With Mongoose, everything is derived from a Schema.
const countryMasterSchema = new mongoose.Schema(
    {
        cid : Number,
        name : String, 
        shortName : String,
        countrycode : String,       
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
const Country = mongoose.models.countries || mongoose.model('Country',countryMasterSchema);
export default Country;