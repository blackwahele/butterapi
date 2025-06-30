import APIError from "../utils/APIError.js";
import jwt from 'jsonwebtoken';
import User_master from "../models/admin/user.model.js";
import dotenv from "dotenv/config";

export const verifyJWTToken = async (req, res, next) => {
    try {
        // const token = req?.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        // const token = req?.cookies?.accessToken || req.header("x-api-key");
        const token = req.header("x-api-key");
        // console.log("verifyJWTToken--->",token)
        if(!token){
            // throw new APIError(401,'Authorization Request!',"You are Unauthorized.",[])
            res.status(401).json(new APIError(401,'Authorization Request!',"You are Unauthorized.",[]))
        }

        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User_master.findById(decodeToken?._id);
        if(!user){
            // throw new APIError(401,'Authorization Request!',"Invalid Token.",[])
            res.status(401).json(new APIError(401,'Authorization Request!',"Invalid Token.",[]))
        }
        req.user= user;
        next();
    } catch (error) {
        // throw new APIError(401,'Authorization Request!',(error?.message || "Invalid access token"),[])

        res.status(401).json(new APIError(401,'Authorization Request!',(error?.message || "Invalid access token"),[]))
    }
}