import mongoose from "mongoose";

//Define Schema - With Mongoose, everything is derived from a Schema.
const wininngCardSchema = new mongoose.Schema(
    {
        sess_id : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : 'Current_session'
        },
        card_id : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : 'Card'
        },
        total_bet_amt : {
            type : Number,
            required : true
        },
        total_users : {
            type : Number,
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
const Winning_card = mongoose.models.winning_cards || mongoose.model('Winning_cards',wininngCardSchema);
export default Winning_card;