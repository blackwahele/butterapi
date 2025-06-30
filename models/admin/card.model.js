import mongoose from "mongoose";

//Define Schema - With Mongoose, everything is derived from a Schema.
const cardMasterSchema = new mongoose.Schema(
    {
        cardName : {
            type: String,
            required: true,
            trim: true,
            match: [/^[a-zA-Z ]+$/, 'Please Enter Valid Character.'],
            maxLength:25
        },
        cardImage : {
            type: String,
            required: true,
            trim: true
        },   
        sort : Number,     
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
 *   In this case, each document will be a Card_master with properties and behaviors as declared in our schema. 
*/
const Card_master = mongoose.models.cards || mongoose.model('Card',cardMasterSchema);
export default Card_master;