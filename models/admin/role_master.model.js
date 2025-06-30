import mongoose from "mongoose";

//Define Schema - With Mongoose, everything is derived from a Schema.
const roleMasterSchema = new mongoose.Schema(
    {
        rolename : {
            type: String,
            required: true,
            trim: true,
            match: [/^[a-zA-Z ]+$/, 'Please Enter Valid Character.'],
            maxLength:25
        },
        issys : Boolean,        
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
 *   In this case, each document will be a Role_master with properties and behaviors as declared in our schema. 
*/
const Role_master = mongoose.models.role_masters || mongoose.model('Role_master',roleMasterSchema);
export default Role_master;