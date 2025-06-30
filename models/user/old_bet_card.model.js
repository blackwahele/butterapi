import mongoose from "mongoose";

//Define Schema - With Mongoose, everything is derived from a Schema.
const oldBetOnCardSchema = new mongoose.Schema(
    {
        old_id : {
            type : mongoose.Schema.Types.ObjectId,
            required : true
        },
        sess_user_id : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : 'Current_bet_by_user'
        },
        card_id : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : 'Card'
        },
        bet_amt : {
            type : Number,
            required : true
        },
        mutiplyBy : {
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
const Old_current_bet_on_card = mongoose.models.old_bet_on_cards || mongoose.model('Old_bet_on_card',oldBetOnCardSchema);
export default Old_current_bet_on_card;