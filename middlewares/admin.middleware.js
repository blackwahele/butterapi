import ApiError from "../utils/APIError.js";
import * as Yup from 'yup';

export const ManageAdminMiddleware = async function(req, res, next) {
    const reqObj = {
        firstName : Yup.string().required(),
        lastName : Yup.string().required(),
        userName : req?.body?.adminId ? Yup.string() : Yup.string().required(),
        email : Yup.string(),
        country : Yup.string().required(),
        state : Yup.string().required(),
        city : Yup.string().required(),
        password : req?.body?.adminId ? Yup.string() : Yup.string().required(),
        mobCode : Yup.string(),
        mobile : req?.body?.adminId ? Yup.string() : Yup.string().required(),
        roleid : Yup.string().required()
    }
    const requestSchema = Yup.object(reqObj);
    try {
        if(!req.body){
            return res.status(500).json(new ApiError(500,"Admin List Request!", "Empty Request body."));
        };
        
        await requestSchema.validate(req.body); 

        next();
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Admin List Request!", error?.message,error));
        // throw new ApiError(500,"Card List Request!", error?.message,error);        
    }
}