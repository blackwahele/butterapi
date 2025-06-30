import ApiError from "../../utils/APIError.js";
import ApiResponse from "../../utils/APIResponse.js";
import { STATUS } from "../../constant/GlobalConstant.js";
import Next_game_time from "../../models/next_game_time.model.js";

export const NextGameTimeList = async (req,res) => {
    try {
         const result = await Next_game_time.find();
         return res.status(200).json(new ApiResponse(200,"Next Game Time List Request!",result,"Fetch Data Successfully."))
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Next Game Time List Request!",error?.message,error));
        // throw new ApiError(500,"Next Game Time List Request!", error?.message,error);
    }
}

export const ManageNextGameTimeData = async (req,res) => {
    
    try {
        let nextGameTimeId = req?.body?.nextGameTimeId;
        const nextGameTimeVal = req?.body?.timeInMin ? parseInt(req?.body?.timeInMin) : 15;
        let isExistsObj = !nextGameTimeId ? {timeInMin : nextGameTimeVal} : { _id :{ $ne : nextGameTimeId }, timeInMin : nextGameTimeVal };        
        let isExists = await Next_game_time.findOne(isExistsObj);
        
        if(isExists){
            return res.status(200).json(new ApiError(400,"Manage Next Game Time Request!","Next Game Time Already Exists!"));
        };
       
        let msg = nextGameTimeId ? "Update Data Successfully." : "Save Data Successfully.";
        let reqObj = { 
            timeInMin : parseInt(nextGameTimeVal)
        };       
        let NextGameData = {};

        if(nextGameTimeId) {
            NextGameData = await Next_game_time.findById(nextGameTimeId);
            NextGameData.timeInMin = parseInt(nextGameTimeVal);
        }else{
            
            reqObj = { ...reqObj, status : STATUS?.ACTIVE }
            NextGameData = new Next_game_time(reqObj);
        }
        
        await NextGameData.save();        
        return res.status(200).json(new ApiResponse(200,"Manage Next Game Time Request!",msg));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Manage Next Game Time Request!",error?.message,error));
        // throw new ApiError(500,"Manage Next Game Time Request!", error?.message,error);
    }
}

export const NextGameTimeDetailData = async (req,res) => {
    try {
        let nextGameTimeId = req?.params?.id;
        let nextGameTimeData = await Next_game_time.findById(nextGameTimeId);
        return res.status(200).json(new ApiResponse(200,"Next Game Time Detail Request!","Fetch Data Successfully.",nextGameTimeData));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Manage Next Game Time Request!",error?.message,error));
        // throw new ApiError(500,"Manage Role Request!", error?.message,error);
    }
}

export const ManageNextGameTimeStatusData = async (req,res) => {
    try {
         let nextGameTimeId = req?.params?.id;
        if(!nextGameTimeId){
            return res.status(200).json(new ApiError(400,"Manage Next Game Time Status Request!","Please provide nextGameTimeId."));
        }
        let role = await Next_game_time.findById(nextGameTimeId);
        if(!role){
            return res.status(200).json(new ApiError(400,"Manage Next Game Time Status Request!","Next Game Time not exist."));
        }
        role.status = role.status == STATUS.ACTIVE ? STATUS.SUSPENDED : STATUS.ACTIVE; 
        await role.save()

        return res.status(200).json(new ApiResponse(200,"Manage Next Game Time Status Request!",[],"Change Data Status Successfully."));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Manage Next Game Time Status Request!",error?.message,error));
        // throw new ApiError(500,"Manage Next Game Time Request!", error?.message,error);
    }
}

export const DeleteNextGameTimeData = async (req,res) => {
    try {        
        let nextGameTimeId = req?.params?.id;
        if(!nextGameTimeId){
            return res.status(200).json(new ApiError(400,"Delete Next Game Time Request!","Please provide multipleAmtId."));
        }
        let deleteRole = await Next_game_time.findByIdAndDelete(nextGameTimeId);
        if (!deleteRole) {
            return res.status(200).json(new ApiError(404,"Delete Next Game Time Request!","No Next Game Time Exist For This MultipleAmtId."));
        }    
        return res.status(200).json(new ApiResponse(200,"Delete Next Game Time Request!","Delete Data Successfully."));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Delete Next Game Time Request!",error?.message,error));
        // throw new ApiError(500,"Delete Next Game Time Request!", error?.message,error);
    }
}