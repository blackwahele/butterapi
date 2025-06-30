import ApiError from "../../utils/APIError.js";
import ApiResponse from "../../utils/APIResponse.js";
import { STATUS } from "../../constant/GlobalConstant.js";
import Game_start_time from "../../models/game_start_time.model.js";

export const GameStartTimeList = async (req,res) => {
    try {
         const result = await Game_start_time.find();
         return res.status(200).json(new ApiResponse(200,"Game Start Time List Request!",result,"Fetch Data Successfully."))
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Game Start Time List Request!",error?.message,error));
        // throw new ApiError(500,"Game Start Time List Request!", error?.message,error);
    }
}

export const ManageGameStartTimeData = async (req,res) => {
    
    try {
        let gameStartTimeId = req?.body?.gameStartTimeId;
        const gameStartTimeVal = req?.body?.timeInMin ? parseInt(req?.body?.timeInMin) : 15;
        let isExistsObj = !gameStartTimeId ? {timeInMin : gameStartTimeVal} : { _id :{ $ne : gameStartTimeId }, timeInMin : gameStartTimeVal };        
        let isExists = await Game_start_time.findOne(isExistsObj);
        
        if(isExists){
            return res.status(200).json(new ApiError(400,"Manage Game Start Time Request!","Game Start Time Already Exists!"));
        };
       
        let msg = gameStartTimeId ? "Update Data Successfully." : "Save Data Successfully.";
        let reqObj = { 
            timeInMin : parseInt(gameStartTimeVal)
        };       
        let GameStartData = {};

        if(gameStartTimeId) {
            GameStartData = await Game_start_time.findById(gameStartTimeId);
            GameStartData.timeInMin = parseInt(gameStartTimeVal);
        }else{            
            reqObj = { ...reqObj, status : STATUS?.ACTIVE }
            GameStartData = new Game_start_time(reqObj);
        }
        
        await GameStartData.save();        
        return res.status(200).json(new ApiResponse(200,"Manage Game Start Time Request!",msg));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Manage Game Start Time Request!",error?.message,error));
        // throw new ApiError(500,"Manage Game Start Time Request!", error?.message,error);
    }
}

export const GameStartTimeDetailData = async (req,res) => {
    try {
        let gameStartTimeId = req?.params?.id;
        let gameStartTimeData = await Game_start_time.findById(gameStartTimeId);
        return res.status(200).json(new ApiResponse(200,"Game Start Time Detail Request!","Fetch Data Successfully.",gameStartTimeData));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Manage Game Start Time Request!",error?.message,error));
        // throw new ApiError(500,"Manage Role Request!", error?.message,error);
    }
}

export const ManageGameStartTimeStatusData = async (req,res) => {
    try {
         let gameStartTimeId = req?.params?.id;
        if(!gameStartTimeId){
            return res.status(200).json(new ApiError(400,"Manage Game Start Time Status Request!","Please provide gameStartTimeId."));
        }
        let gameStartTimeData = await Game_start_time.findById(gameStartTimeId);
        if(!gameStartTimeData){
            return res.status(200).json(new ApiError(400,"Manage Game Start Time Status Request!","Game Start Time not exist."));
        }
        gameStartTimeData.status = gameStartTimeData.status == STATUS.ACTIVE ? STATUS.SUSPENDED : STATUS.ACTIVE; 
        await gameStartTimeData.save()

        return res.status(200).json(new ApiResponse(200,"Manage Game Start Time Status Request!",[],"Change Data Status Successfully."));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Manage Game Start Time Status Request!",error?.message,error));
        // throw new ApiError(500,"Manage Game Start Time Request!", error?.message,error);
    }
}

export const DeleteGameStartTimeData = async (req,res) => {
    try {        
        let gameStartTimeId = req?.params?.id;
        if(!gameStartTimeId){
            return res.status(200).json(new ApiError(400,"Delete Game Start Time Request!","Please provide multipleAmtId."));
        }
        let deleteGameStartTime = await Game_start_time.findByIdAndDelete(gameStartTimeId);
        if (!deleteGameStartTime) {
            return res.status(200).json(new ApiError(404,"Delete Game Start Time Request!","No Game Start Time Exist For This MultipleAmtId."));
        }    
        return res.status(200).json(new ApiResponse(200,"Delete Game Start Time Request!","Delete Data Successfully."));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Delete Game Start Time Request!",error?.message,error));
        // throw new ApiError(500,"Delete Game Start Time Request!", error?.message,error);
    }
}