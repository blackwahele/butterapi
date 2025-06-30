import ApiError from "../../utils/APIError.js";
import ApiResponse from "../../utils/APIResponse.js";
import { STATUS } from "../../constant/GlobalConstant.js";
import Card_reveal_time from "../../models/card_reveal_time.model.js";

export const CardRevealTimeList = async (req,res) => {
    try {
         const result = await Card_reveal_time.find();
         return res.status(200).json(new ApiResponse(200,"Card Reveal Time List Request!",result,"Fetch Data Successfully."))
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Card Reveal Time List Request!",error?.message,error));
        // throw new ApiError(500,"Card Reveal Time List Request!", error?.message,error);
    }
}

export const ManageCardRevealTimeData = async (req,res) => {
    
    try {
        let CardRevealTimeId = req?.body?.cardRevealTimeId;
        const CardRevealTimeVal = req?.body?.timeInMin ? parseInt(req?.body?.timeInMin) : 15;
        let isExistsObj = !CardRevealTimeId ? {timeInMin : CardRevealTimeVal} : { _id :{ $ne : CardRevealTimeId }, timeInMin : CardRevealTimeVal };        
        let isExists = await Card_reveal_time.findOne(isExistsObj);

        if(isExists){
            return res.status(200).json(new ApiError(400,"Manage Card Reveal Time Request!","Card Reveal Time Already Exists!"));
        };
       
        let msg = CardRevealTimeId ? "Update Data Successfully." : "Save Data Successfully.";
        let reqObj = { 
            timeInMin : parseInt(CardRevealTimeVal)
        };       
        let CardRevealTimeData = {};

        if(CardRevealTimeId) {
            CardRevealTimeData = await Card_reveal_time.findById(CardRevealTimeId);
            CardRevealTimeData.timeInMin = parseInt(CardRevealTimeVal);
        }else{            
            reqObj = { ...reqObj, status : STATUS?.ACTIVE }
            CardRevealTimeData = new Card_reveal_time(reqObj);
        }
        
        await CardRevealTimeData.save();        
        return res.status(200).json(new ApiResponse(200,"Manage Card Reveal Time Request!",msg));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Manage Card Reveal Time Request!",error?.message,error));
        // throw new ApiError(500,"Manage Card Reveal Time Request!", error?.message,error);
    }
}

export const CardRevealTimeDetailData = async (req,res) => {
    try {
        let CardRevealTimeId = req?.params?.id;
        let CardRevealTimeData = await Card_reveal_time.findById(CardRevealTimeId);
        return res.status(200).json(new ApiResponse(200,"Card Reveal Time Detail Request!","Fetch Data Successfully.",CardRevealTimeData));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Manage Card Reveal Time Request!",error?.message,error));
        // throw new ApiError(500,"Manage Role Request!", error?.message,error);
    }
}

export const ManageCardRevealTimeStatusData = async (req,res) => {
    try {
         let CardRevealTimeId = req?.params?.id;
        if(!CardRevealTimeId){
            return res.status(200).json(new ApiError(400,"Manage Card Reveal Time Status Request!","Please provide CardRevealTimeId."));
        }
        let role = await Card_reveal_time.findById(CardRevealTimeId);
        if(!role){
            return res.status(200).json(new ApiError(400,"Manage Card Reveal Time Status Request!","Card Reveal Time not exist."));
        }
        role.status = role.status == STATUS.ACTIVE ? STATUS.SUSPENDED : STATUS.ACTIVE; 
        await role.save()

        return res.status(200).json(new ApiResponse(200,"Manage Card Reveal Time Status Request!",[],"Change Data Status Successfully."));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Manage Card Reveal Time Status Request!",error?.message,error));
        // throw new ApiError(500,"Manage Card Reveal Time Request!", error?.message,error);
    }
}

export const DeleteCardRevealTimeData = async (req,res) => {
    try {        
        let CardRevealTimeId = req?.params?.id;
        if(!CardRevealTimeId){
            return res.status(200).json(new ApiError(400,"Delete Card Reveal Time Request!","Please provide multipleAmtId."));
        }
        let deleteRole = await Card_reveal_time.findByIdAndDelete(CardRevealTimeId);
        if (!deleteRole) {
            return res.status(200).json(new ApiError(404,"Delete Card Reveal Time Request!","No Card Reveal Time Exist For This MultipleAmtId."));
        }    
        return res.status(200).json(new ApiResponse(200,"Delete Card Reveal Time Request!","Delete Data Successfully."));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Delete Card Reveal Time Request!",error?.message,error));
        // throw new ApiError(500,"Delete Card Reveal Time Request!", error?.message,error);
    }
}