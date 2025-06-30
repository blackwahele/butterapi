import mongoose from "mongoose";

//Define Schema - With Mongoose, everything is derived from a Schema.
const adminAccountHistoryMasterSchema = new mongoose.Schema(
    {
        sess_name : {
            type : String,
            required : true
        }, 
        sess_id : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : 'Old_session'
        },
        total_users : {
            type : Number,
            required : true
        }, 
       
        win_amt : {
            type : Number,
            required : true
        }, 
        loose_amt : {
            type : Number,
            required : true
        }, 
        mutiplyBy : {
            type: Number,
            required: true,
            trim: true
        }, 
        total_loose_amt : {
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
const Admin_account_history = mongoose.models.Admin_account_histories || mongoose.model('Admin_account_history',adminAccountHistoryMasterSchema);
export default Admin_account_history;