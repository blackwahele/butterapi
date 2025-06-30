import mongoose from "mongoose";

//Define Schema - With Mongoose, everything is derived from a Schema.
const winningUserHistoryMasterSchema = new mongoose.Schema(
    {
        sess_id : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : 'Old_session'
        },
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User',           
            required: true
        },
        cardId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Card',           
            required: true
        }, 
        bet_amt : {
            type : Number,
            required : true
        }, 
        mutiplyBy : {
            type: String,
            required: true,
            trim: true
        },
        total_bet_amt : {
            type : Number,
            required : true
        },    
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
const Winning_user_history = mongoose.models.winning_user_histories || mongoose.model('Winning_user_history',winningUserHistoryMasterSchema);
export default Winning_user_history;