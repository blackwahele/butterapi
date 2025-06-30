import mongoose from "mongoose";

//Define Schema - With Mongoose, everything is derived from a Schema.
const multiplyAMtMasterSchema = new mongoose.Schema(
    {
        multiply_amount : {
            type: Number,
            required: true,
            trim: true,
            match: [/^[a-zA-Z]+$/, 'Please Enter Valid Character.'],
            maxLength:25
        },  
        status : { type: String,  enum: ['Active', 'Suspended'] },
        isDeleted : Boolean       
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
 *   In this case, each document will be a MultiplyAmt with properties and behaviors as declared in our schema. 
*/
const MultiplyAmt = mongoose.models.multiply_amts || mongoose.model('Multiply_amt',multiplyAMtMasterSchema);
export default MultiplyAmt;