import ApiError from "../utils/APIError.js";

export const ManageRoleMiddleware = async function(req, res, next) {
    try {
        if(!req.body){
            return res.status(500).json(new ApiError(500,"Role List Request!", "Empty Request body."));
        };

        if (!req.body.roleName){
            return res.status(500).json(new ApiError(500,"Role List Request!", "Please Provide Rolename."));
        };
        // if(!req.body.moduleAccess){
        //     return res.status(500).json(new ApiError(500,"Role List Request!", "Please provide module Access."));
        // };
        next();
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Role List Request!", error?.message,error));
        // throw new ApiError(500,"Role List Request!", error?.message,error);        
    }
}