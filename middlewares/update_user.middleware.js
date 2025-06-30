import ApiError from "../utils/APIError.js";
import * as Yup from 'yup';

export const ManageUserUpdateMiddleware = async function(req, res, next) {
    const reqObj = {
        firstName : Yup.string().required(),
        lastName : Yup.string().required(),       
        country : Yup.string().required(),
        state : Yup.string().required(),
        city : Yup.string().required(),       
        // mobCode : Yup.string(),        
    }
    const requestSchema = Yup.object(reqObj);
    try {
        if(!req.body){
            return res.status(500).json(new ApiError(500,"User Update Request!", "Empty Request body."));
        };
        
        await requestSchema.validate(req.body); 

        next();
    } catch (error) {
        return res.status(500).json(new ApiError(500,"User Update Request!", error?.message,error));
        // throw new ApiError(500,"Card List Request!", error?.message,error);        
    }
}

export const ManageChangePasswordMiddleware = async function(req, res, next) {
    const reqObj = {
        old_pass : Yup.string().required(),
        new_pass : Yup.string().required(),       
        confirm_pass : Yup.string().required()
    }
    const requestSchema = Yup.object(reqObj);
    try {
        if(!req.body){
            return res.status(500).json(new ApiError(500,"Change Password Request!", "Empty Request body."));
        };
        
        await requestSchema.validate(req.body); 

        next();
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Change Password Request!", error?.message,error));
        // throw new ApiError(500,"Card List Request!", error?.message,error);        
    }
}