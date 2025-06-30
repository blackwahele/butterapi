import ApiError from "../utils/APIError.js";
import * as Yup from 'yup';

const requestSchema = Yup.object({  
    email : Yup.string().required(),
    password : Yup.string().required()
});

export const LoginMiddleware = async function(req, res, next) {
    try {
        await requestSchema.validate(req.body);     
        next();
    } catch (err) {
        const errData = err?.errors?.map((err) => err);
        return res.status(500).json(new ApiError(500,"Login Request!", errData?.toString(),errData));
        // throw new ApiError(500,"Role List Request!", error?.message,error);        
    }
}