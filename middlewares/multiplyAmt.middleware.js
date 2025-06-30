import ApiError from "../utils/APIError.js";
import * as Yup from 'yup';

const requestSchema = Yup.object({
    multiplyAmt : Yup.number().required(),
    // cardImage : Yup.mixed().required()
});

export const ManageMultiplyAmtMiddleware = async function(req, res, next) {
    try {
        if(!req.body){
            return res.status(500).json(new ApiError(500,"Multiply Amount List Request!", "Empty Request body."));
        };
        
        await requestSchema.validate(req.body); 

        next();
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Multiply Amount List Request!", error?.message,error));
        // throw new ApiError(500,"Card List Request!", error?.message,error);        
    }
}