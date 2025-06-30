import ApiError from "../../utils/APIError.js";
import ApiResponse from "../../utils/APIResponse.js";
import { STATUS } from "../../constant/GlobalConstant.js";
import Role from "../../models/admin/role_master.model.js";

export const RoleList = async (req,res) => {
    try {
         const result = await Role.find();
         return res.status(200).json(new ApiResponse(200,"Role List Request!",result,"Fetch Data Successfully."))
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Role List Request!",error?.message,error));
        // throw new ApiError(500,"Role List Request!", error?.message,error);
    }
}

export const ManageRoleData = async (req,res) => {
    try {
         let roleId = req?.body?.roleId;
        let isExistsObj = !roleId ? {rolename : req?.body?.rolename} : { _id :{ $ne : roleId }, rolename : req?.body?.rolename };        
        let isExists = await Role.findOne(isExistsObj)
        if(isExists){
            return res.status(200).json(new ApiError(400,"Manage Role Request!","Role Name Already Exists!"));
        };
       
        let msg = roleId ? "Update Data Successfully." : "Save Data Successfully.";
        let reqObj = { 
            rolename : req.body.roleName 
        };       
        let RoleData = {};

        if(roleId) {
            RoleData = await Role.findById(roleId);
            RoleData.rolename = req.body.roleName;
        }else{
            reqObj = { ...reqObj, isSys: true, status : STATUS?.ACTIVE }
            RoleData = new Role(reqObj);
        }
        
        await RoleData.save();        
        return res.status(200).json(new ApiResponse(200,"Manage Role Request!",[],msg));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Manage Role Request!",error?.message,error));
        // throw new ApiError(500,"Manage Role Request!", error?.message,error);
    }
}

export const RoleDetailData = async (req,res) => {
    try {
        let roleId = req?.params?.id;
        let roleData = await Role.findById(roleId);
        return res.status(200).json(new ApiResponse(200,"Role Detail Request!",roleData,"Fetch Data Successfully."));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Manage Role Request!",error?.message,error));
        // throw new ApiError(500,"Manage Role Request!", error?.message,error);
    }
}

export const ManageRoleStatusData = async (req,res) => {
    try {
         let roleId = req?.params?.id;
        if(!roleId){
            return res.status(200).json(new ApiError(400,"Manage Role Status Request!","Please provide roleId."));
        }
        let role = await Role.findById(roleId);
        if(!role){
            return res.status(200).json(new ApiError(400,"Manage Role Status Request!","Role not exist."));
        }
        role.status = role.status == STATUS.ACTIVE ? STATUS.SUSPENDED : STATUS.ACTIVE; 
        await role.save()

        return res.status(200).json(new ApiResponse(200,"Manage Role Status Request!",[],"Change Data Status Successfully."));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Manage Role Status Request!",error?.message,error));
        // throw new ApiError(500,"Manage Role Request!", error?.message,error);
    }
}

export const DeleteRoleData = async (req,res) => {
    try {        
        let roleId = req?.params?.id;
        if(!roleId){
            return res.status(200).json(new ApiError(400,"Delete Role Request!","Please provide roleId."));
        }
        let deleteRole = await Role.findByIdAndDelete(roleId);
        if (!deleteRole) {
            return res.status(200).json(new ApiError(404,"Delete Role Request!","No Role Exist For This RoleId."));
        }    
        return res.status(200).json(new ApiResponse(200,"Delete Role Request!",[],"Delete Data Successfully."));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Delete Role Request!",error?.message,error));
        // throw new ApiError(500,"Delete Role Request!", error?.message,error);
    }
}