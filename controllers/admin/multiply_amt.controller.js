import ApiError from "../../utils/APIError.js";
import ApiResponse from "../../utils/APIResponse.js";
import { STATUS } from "../../constant/GlobalConstant.js";
import MultiplyAmt from "../../models/admin/multiply_amt.model.js";

export const MultiplyAmtList = async (req,res) => {
    try {
         const result = await MultiplyAmt.find();
         return res.status(200).json(new ApiResponse(200,"Multiply Amount List Request!",result,"Fetch Data Successfully."))
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Multiply Amount List Request!",error?.message,error));
        // throw new ApiError(500,"Multiply Amount List Request!", error?.message,error);
    }
}

export const ManageMultiplyAmtData = async (req,res) => {
    try {
         let multiplyAmtId = req?.body?.multiplyAmtId;
        let isExistsObj = !multiplyAmtId ? {multiply_amount : req?.body?.multiplyAmt} : { _id :{ $ne : multiplyAmtId }, multiply_amount : req?.body?.multiplyAmt };        
        let isExists = await MultiplyAmt.findOne(isExistsObj)
        if(isExists){
            return res.status(200).json(new ApiError(400,"Manage Multiply Amount Request!","Multiply Amount Name Already Exists!"));
        };
       
        let msg = multiplyAmtId ? "Update Data Successfully." : "Save Data Successfully.";
        let reqObj = { 
            multiply_amount : req.body.multiplyAmt 
        };       
        let MultiplyAmtData = {};

        if(multiplyAmtId) {
            MultiplyAmtData = await MultiplyAmt.findById(multiplyAmtId);
            MultiplyAmtData.multiply_amount = req.body.multiplyAmt;
        }else{
            reqObj = { ...reqObj, status : STATUS?.ACTIVE }
            MultiplyAmtData = new MultiplyAmt(reqObj);
        }
        
        await MultiplyAmtData.save();        
        return res.status(200).json(new ApiResponse(200,"Manage Multiply Amount Request!",msg));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Manage Multiply Amount Request!",error?.message,error));
        // throw new ApiError(500,"Manage Multiply Amount Request!", error?.message,error);
    }
}

export const MultiplyAmtDetailData = async (req,res) => {
    try {
        let multiplyAmtId = req?.params?.id;
        let multiplyAmtData = await MultiplyAmt.findById(multiplyAmtId);
        return res.status(200).json(new ApiResponse(200,"Multiply Amount Detail Request!","Fetch Data Successfully.",multiplyAmtData));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Manage Multiply Amount Request!",error?.message,error));
        // throw new ApiError(500,"Manage Role Request!", error?.message,error);
    }
}

export const ManageMultiplyAmtStatusData = async (req,res) => {
    try {
         let roleId = req?.params?.id;
        if(!roleId){
            return res.status(200).json(new ApiError(400,"Manage Multiply Amount Status Request!","Please provide roleId."));
        }
        let role = await MultiplyAmt.findById(roleId);
        if(!role){
            return res.status(200).json(new ApiError(400,"Manage Multiply Amount Status Request!","Multiply Amount not exist."));
        }
        role.status = role.status == STATUS.ACTIVE ? STATUS.SUSPENDED : STATUS.ACTIVE; 
        await role.save()

        return res.status(200).json(new ApiResponse(200,"Manage Multiply Amount Status Request!",[],"Change Data Status Successfully."));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Manage Multiply Amount Status Request!",error?.message,error));
        // throw new ApiError(500,"Manage Multiply Amount Request!", error?.message,error);
    }
}

export const DeleteMultiplyAmtData = async (req,res) => {
    try {        
        let roleId = req?.params?.id;
        if(!roleId){
            return res.status(200).json(new ApiError(400,"Delete Multiply Amount Request!","Please provide multipleAmtId."));
        }
        let deleteRole = await MultiplyAmt.findByIdAndDelete(roleId);
        if (!deleteRole) {
            return res.status(200).json(new ApiError(404,"Delete Multiply Amount Request!","No Multiply Amount Exist For This MultipleAmtId."));
        }    
        return res.status(200).json(new ApiResponse(200,"Delete Multiply Amount Request!","Delete Data Successfully."));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Delete Multiply Amount Request!",error?.message,error));
        // throw new ApiError(500,"Delete Multiply Amount Request!", error?.message,error);
    }
}