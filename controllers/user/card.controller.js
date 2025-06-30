import Card_master from "../../models/admin/card.model.js";
import ApiResponse from "../../utils/APIResponse.js";
import APIError from "../../utils/APIError.js";

export const CardList = async (req,res) => {
    try {
         const result = await Card_master.find({status : 'Active'}).select('cardName cardImage');
         return res.status(200).json(new ApiResponse(200,"Card List Request!",result,"Fetch Data Successfully."))
    } catch (error) {
         Log.error(`Con::card(CardList) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Card List Request!",error?.message,error));
        // throw new ApiError(500,"Role List Request!", error?.message,error);
    }
}