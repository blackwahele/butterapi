import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv/config';

//Define Schema - With Mongoose, everything is derived from a Schema.
const userMasterSchema = new mongoose.Schema(
    {
        firstName : {
            type: String,
            required: true,
            trim: true,
            match: [/^[a-zA-Z]+$/, 'Please Enter Valid Character.'],
            maxLength:10
        },
        lastName : {
            type: String,
            required: true,
            trim: true,
            match: [/^[a-zA-Z]+$/, 'Please Enter Valid Character.'],
            maxLength:15
        }, 
        userName : {
            type: String,
            required: true,
            unique : true,
            trim: true,
            maxLength:15
        },   
        email : {
            type : String,
            unique : true,
            trim : true
        },       
        country : {
            type: Number,
            required : true
        },
        state : {
            type : Number,
            required : true
        },
        city : {
            type: String,
            required : true,
            maxLength: 30
        },       
        password : {
             type: String,
             required : true
        },
        mobCode : String,
        mobile : Number,
        roleid : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Role_master'
        },
        wallet_amt : Number,
        forgottoken : String,
        forgot_date : Date,
        logintoken : String,
        logintime : Date,
        logouttime : Date,
        lastactivity : String,
        isapproved : Boolean,
        isverified : Boolean,
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
 *   In this case, each document will be a user_master with properties and behaviors as declared in our schema. 
*/

userMasterSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

userMasterSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            organization : "Butterfly",
            email: this.email,
            userName: this.userName,
            wallet_amt : this.wallet_amt,
            fullName: `${this.firstName} ${this.lastName}`
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userMasterSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userMasterSchema.virtual('fullName').get(function(){
    return `${this.firstName} ${this.lastName}`;
})

const User_master = mongoose.models.users || mongoose.model('User',userMasterSchema);
export default User_master;