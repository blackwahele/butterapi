import ApiError from "../../utils/APIError.js";
import ApiResponse from "../../utils/APIResponse.js";
import { STATUS } from "../../constant/GlobalConstant.js";
import Card from "../../models/admin/card.model.js";
import dotenv from 'dotenv/config';

const INITIAL_IMG_PATH = process.env.IMAGE_URL;

export const CardList = async (req,res) => {
    try {
         const result = await Card.find();
         return res.status(200).json(new ApiResponse(200,"Card List Request!", result, "Fetch Data Successfully."))
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Card List Request!",error?.message,error));
        // throw new ApiError(500,"Card List Request!", error?.message,error);
    }
}

export const ManageCardData = async (req,res) => {
    try {
        let cardId = req?.body?.cardId;
        let isExistsObj = !cardId ? {cardName : req?.body?.cardName} : { _id :{ $ne : cardId }, cardName : req?.body?.cardName };        
        let isExists = await Card.findOne(isExistsObj)
        if(isExists){
            return res.status(200).json(new ApiError(400,"Manage Card Request!","Card Name Already Exists!"));
        };
       
        let msg = cardId ? "Update Data Successfully." : "Save Data Successfully.";
        let reqObj = { 
            cardName : req.body.cardName, 
            cardImage : req.files?.[0]?.filename ? (INITIAL_IMG_PATH + req.files?.[0]?.filename) : ''
        };       
        let CardData = {};

        if(cardId) {
            CardData = await Card.findById(cardId);
            CardData.cardName = req.body.cardName;
            CardData.cardImage = req.files?.[0]?.filename ? (INITIAL_IMG_PATH + req.files?.[0]?.filename) : CardData?.cardImage;
        }else{
            let LatestCard = await Card.findOne().sort({ sort : -1});
            if(LatestCard){
                reqObj = { ...reqObj, sort : (LatestCard.sort + 1) , status : STATUS?.ACTIVE }
            }else{
                reqObj = { ...reqObj, sort : 1, status : STATUS?.ACTIVE }
            }
            CardData = new Card(reqObj);
        }        
        await CardData.save();        
        return res.status(200).json(new ApiResponse(200,"Manage Card Request!",msg));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Manage Card Request!",error?.message,error));
        // throw new ApiError(500,"Manage Card Request!", error?.message,error);
    }
}

export const CardDetailData = async (req,res) => {
    try {
        let roleId = req?.params?.id;
        let roleData = await Card.findById(roleId);
        return res.status(200).json(new ApiResponse(200,"Card Detail Request!","Fetch Data Successfully.",roleData));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Manage Card Request!",error?.message,error));
        // throw new ApiError(500,"Manage Card Request!", error?.message,error);
    }
}

export const ManageCardStatusData = async (req,res) => {
    try {
         let roleId = req?.params?.id;
        if(!roleId){
            return res.status(200).json(new ApiError(400,"Manage Card Status Request!","Please provide cardId."));
        }
        let role = await Card.findById(roleId);
        if(!role){
            return res.status(200).json(new ApiError(400,"Manage Card Status Request!","Card not exist."));
        }
        role.status = role.status == STATUS.ACTIVE ? STATUS.SUSPENDED : STATUS.ACTIVE; 
        await role.save()

        return res.status(200).json(new ApiResponse(200,"Manage Card Status Request!","Change Data Status Successfully."));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Manage Card Status Request!",error?.message,error));
        // throw new ApiError(500,"Manage Card Request!", error?.message,error);
    }
}

export const DeleteCardData = async (req,res) => {
    try {        
        let roleId = req?.params?.id;
        if(!roleId){
            return res.status(200).json(new ApiError(400,"Delete Card Request!","Please provide roleId."));
        }
        let deleteRole = await Card.findByIdAndDelete(roleId);
        if (!deleteRole) {
            return res.status(200).json(new ApiError(404,"Delete Card Request!","No Card Exist For This RoleId."));
        }    
        return res.status(200).json(new ApiResponse(200,"Delete Card Request!","Delete Data Successfully."));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Delete Card Request!",error?.message,error));
        // throw new ApiError(500,"Delete Role Request!", error?.message,error);
    }
}