import mongoose from "mongoose";

//Define Schema - With Mongoose, everything is derived from a Schema.
const gameStartTimeSchema = new mongoose.Schema(
    {
        timeInMin : {
            type: Number,
            required: true,
            trim: true,
            match: [/^[0-9]+$/, 'Please Enter Valid Number.'],
            maxLength:5
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
 *   In this case, each document will be a Card_master with properties and behaviors as declared in our schema. 
*/
const Game_start_time = mongoose.models.game_start_times || mongoose.model('Game_start_time',gameStartTimeSchema);
export default Game_start_time;