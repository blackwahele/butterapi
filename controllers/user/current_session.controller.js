import Current_session from "../../models/current_session.model.js";
import ApiResponse from "../../utils/APIResponse.js";
import ApiError from "../../utils/APIError.js";
import mongoose from "mongoose";
import dbTransactions from '../../database/connectionDB.js';
import MultiplyAmt from "../../models/admin/multiply_amt.model.js";
import Current_bet_by_user from "../../models/user/current_bet_user.model.js";
import Current_bet_on_card from "../../models/user/current_bet_card.model.js";
import Current_card_reveal_time from "../../models/current_card_reveal_time.model.js";
import Next_game_start_in from "../../models/next_game_start_in.model.js";

const { ObjectId } = mongoose.Types;

export const GetCurrentSessionTime = async (req,res) => {
    try {
        //  const result = await Current_session.findOne().sort({ isActive : -1});
         const result = await Current_session.findOne({ isActive : true });
         return res.status(200).json(new ApiResponse(200,"Current Session Time Request!",result,"Fetch Data Successfully."))
    } catch (error) {
         Log.error(`Con::user.current_session(GetCurrentSessionTime) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Current Session Time Request!",error?.message,error));
        // throw new ApiError(500,"Role List Request!", error?.message,error);
    }
}

export const GetCardRevealTime = async (req,res) => {
    try {
        //  const result = await Current_card_reveal_time.findOne().sort({ isActive : -1});
         const result = await Current_card_reveal_time.findOne({ isActive : true });
         return res.status(200).json(new ApiResponse(200,"Card Reveal Time Request!",result,"Fetch Data Successfully."))
    } catch (error) {
        Log.error(`Con::user.current_session(GetCardRevealTime) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Card Reveal Time Request!",error?.message,error));
        // throw new ApiError(500,"Role List Request!", error?.message,error);
    }
}

export const GetNextGameStartIn = async (req,res) => {
    try {
        //  const result = await Current_card_reveal_time.findOne().sort({ isActive : -1});
         const result = await Next_game_start_in.findOne({ isActive : true });
         return res.status(200).json(new ApiResponse(200,"Next Game Start In Request!",result,"Fetch Data Successfully."))
    } catch (error) {
        Log.error(`Con::user.current_session(GetNextGameStartIn) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Next Game Start In Request!",error?.message,error));
        // throw new ApiError(500,"Role List Request!", error?.message,error);
    }
}

export const SetUserBetData = async (req,res) => {
    let user = req?.user;
    let session = await dbTransactions.startSession();
    try {
            session.startTransaction();
           let sessId = req?.body?.currentSessId;
           let betAmt = req?.body?.betAmt;
           let cardId = req?.body?.cardId;
          let multiplyData = await MultiplyAmt.findOne();        

        const options = {
            new: true,       // return the updated document
            upsert: true,    // create if not found
            setDefaultsOnInsert: true,
            session 
        };
        let result =  await Current_bet_by_user.findOneAndUpdate(
            {
                current_session_id : sessId,
                user_id : user._id
            },
            {
                current_session_id : sessId,
                user_id : user._id
            }, options);

        await Current_bet_on_card.findOneAndUpdate(
            {
                sess_user_id : result._id,
                card_id : cardId
            },
            {
                sess_user_id : result._id, 
                card_id : cardId, 
                bet_amt : betAmt, 
                mutiplyBy : multiplyData?.multiply_amount
            }, options);

        let BetUserData = await Current_bet_by_user.findOne(
            {current_session_id : new ObjectId(sessId), user_id : new ObjectId(user._id)},
            null,
            { session }
        );

        let BetData = await Current_bet_on_card.aggregate([
            {
                $match : {
                    sess_user_id : BetUserData?._id
                }
            },
            {
                $group : {
                    _id : null,
                    totalBetAmt : {
                        $sum : "$bet_amt"
                    }
                }
            }
        ]).session(session);

        if(BetData?.length > 0){
            if(BetData?.[0]?.totalBetAmt > user?.wallet_amt){
                 await session.abortTransaction();
                 return res.status(200).json(new ApiError(200,"Wallet Check!","You Can Not Bet Amount Greater Than your wallet."));
            }
        }

         await session.commitTransaction();
         return res.status(200).json(new ApiResponse(200,"Set User Bet Data Request!",[],"Set Bet Successfully."))
    } catch (error) {
        await session.abortTransaction();
        Log.error(`Con::user.current_session(SetUserBetData) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Set User Bet Data Request!",error?.message,error));
        // throw new ApiError(500,"Role List Request!", error?.message,error);
    } finally {
        session.endSession();
    }
}

export const GetTotalBetAmt = async (req,res) => {
    let user = req?.user;
    try {            
        let sessId = req?.body?.currentSessId;         

        let BetUserData = await Current_bet_by_user.findOne(
            {current_session_id : new ObjectId(sessId), user_id : new ObjectId(user._id)}
        );

        let BetData = await Current_bet_on_card.aggregate([
            {
                $match : {
                    sess_user_id : BetUserData?._id
                }
            },
            {
                $group : {
                    _id : null,
                    totalBetAmt : {
                        $sum : "$bet_amt"
                    }
                }
            }
        ]);

        if(BetData?.length > 0){
            if(BetData?.[0]?.totalBetAmt > user?.wallet_amt){
                 await session.abortTransaction();
                 return res.status(200).json(new ApiError(200,"Wallet Check!","You Can Not Bet Amount Greater Than your wallet."));
            }
        }
          let obj = {
            total_amt : BetData?.[0]?.totalBetAmt ? BetData?.[0]?.totalBetAmt : 0 
          }
         return res.status(200).json(new ApiResponse(200,"Set User Bet Data Request!",obj,"Set Bet Successfully."))
    } catch (error) {
        Log.error(`Con::user.current_session(GetTotalBetAmt) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Set User Bet Data Request!",error?.message,error));
        // throw new ApiError(500,"Role List Request!", error?.message,error);
    } 
}

export const GetCardDetailList = async (req,res) => {
    let user = req?.user;
    try {            
        let sessId = req?.body?.currentSessId;         

        let BetUserData = await Current_bet_by_user.findOne(
            {current_session_id : new ObjectId(sessId), user_id : new ObjectId(user._id)}
        );

        let BetData = await Current_bet_on_card.find({sess_user_id : BetUserData?._id }).select('bet_amt card_id');
        
        return res.status(200).json(new ApiResponse(200,"Set User Bet Data Request!",BetData,"Set Bet Successfully."))
    } catch (error) {
        Log.error(`Con::user.current_session(GetCardDetailList) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Set User Bet Data Request!",error?.message,error));
        // throw new ApiError(500,"Role List Request!", error?.message,error);
    } 
}

