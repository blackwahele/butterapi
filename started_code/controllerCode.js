import { ReadRoleService, ManageRoleService, ManageRoleStatusService, DeleteRoleService } from "../services/role.service.js";
import ApiError from "../utils/APIError.js";
import ApiResponse from "../utils/APIResponse.js";

export const RoleList = (req,res) => {
    try {
        return ReadRoleService(req,res);
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Role List Request!",error?.message,error));
        // throw new ApiError(500,"Role List Request!", error?.message,error);
    }
}

export const ManageRoleData = (req,res) => {
    try {
        return ManageRoleService(req,res);
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Manage Role Request!",error?.message,error));
        // throw new ApiError(500,"Manage Role Request!", error?.message,error);
    }
}

export const ManageRoleStatusData = (req,res) => {
    try {
        return ManageRoleStatusService(req,res);
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Manage Role Status Request!",error?.message,error));
        // throw new ApiError(500,"Manage Role Request!", error?.message,error);
    }
}

export const DeleteRoleData = (req,res) => {
    try {        
        return DeleteRoleService(req,res);
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Delete Role Request!",error?.message,error));
        // throw new ApiError(500,"Delete Role Request!", error?.message,error);
    }
}