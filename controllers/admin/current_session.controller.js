//Current Model
import Current_session from "../../models/current_session.model.js";
import Current_bet_by_user from "../../models/user/current_bet_user.model.js";
import Current_bet_on_card from "../../models/user/current_bet_card.model.js";

//Old Model
import Old_session from "../../models/old_session.model.js";
import Old_bet_on_card from "../../models/user/old_bet_card.model.js";
import Old_bet_by_user from "../../models/user/old_bet_user.model.js";

import Card from "../../models/admin/card.model.js";
import User_master from "../../models/admin/user.model.js";
import Winning_card from "../../models/admin/winning_card.model.js";
import Winning_user_history from "../../models/admin/winning_user_history.model.js";
import Loose_user_history from "../../models/admin/loose_user_history.model.js";
import Admin_account_history from "../../models/admin/admin_account_history.model.js";
import User_wallet_history from "../../models/user/user_wallet_history.model.js";
import ApiResponse from "../../utils/APIResponse.js";
import ApiError from "../../utils/APIError.js";
import Card_reveal_time from "../../models/card_reveal_time.model.js";
import Current_card_reveal_time from "../../models/current_card_reveal_time.model.js";
import Game_start_time from "../../models/game_start_time.model.js";
import MultiplyAmt from "../../models/admin/multiply_amt.model.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
import dbTransactions from '../../database/connectionDB.js';

export const CurrentSessionList = async (req,res) => {
    try {
         const result = await Current_session.find().sort({ isActive : -1});
         return res.status(200).json(new ApiResponse(200,"Current Session List Request!",result,"Fetch Data Successfully."))
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Current Session List Request!",error?.message,error));
        // throw new ApiError(500,"Role List Request!", error?.message,error);
    }
}

export const GetCurrentCardList = async (req,res) => {
    try {
         const currSessData = await Current_session.findOne({ isActive : true });
         const currSessUser = await Current_bet_by_user.find({ current_session_id : currSessData?._id }).select({_id : 1});
         const idArray = currSessUser.map(item => item._id);
         let CardListData = await Current_bet_on_card.aggregate([
            {
                $match : {
                    sess_user_id : { $in : idArray }
                }
            },
            {
                $lookup : {
                    from: "cards",             // collection to join
                    localField: "card_id",     // field in orders
                    foreignField: "_id",       // field in users
                    as: "card"          // output array field
                }
            },
            {
                $addFields : {
                    card_detail : {
                        $first : "$card"
                    }
                }
            },
            {
                $group : {
                    _id : "$card_id",
                    total_bet : {
                        $sum : "$bet_amt"
                    },
                    uniqueUsers: { $addToSet: "$sess_user_id" },
                    card_name : { $first : "$card_detail.cardName" },
                    card_image : { $first : "$card_detail.cardImage" },
                    card_id : { $first : "$card_id" },
                    sess_user_id : { $first : "$sess_user_id" },
                }
            },
            {
                 $project: {
                    _id: 1,
                    total_bet : 1,
                    total_users: { $size: "$uniqueUsers" },
                    card_id : 1,
                    card_name: 1,
                    card_image: 1,
                    sess_user_id: 1,
                }
            },
            {
                $sort : {
                    total_bet : -1
                }
            }
         ]);

         const InCardIds = CardListData.map((O)=>O?.card_id);
         if(InCardIds?.length > 0){
            const GetZeroCardData = await Card.find({ _id : { $nin : InCardIds }});
            let ZeroCardData = [];
            GetZeroCardData?.forEach((val)=>{
                let tempObj = {
                    _id : null,
                    card_id : val?._id,
                    card_image : val?.cardImage,
                    card_name : val?.cardName,
                    sess_user_id : null,
                    curr_sess_is : currSessData?._id,
                    total_bet : 0,
                    total_users : 0
                }

                ZeroCardData = [...ZeroCardData, tempObj];
            });
            CardListData = [...CardListData, ...ZeroCardData];
         }else{
            const GetZeroCardData = await Card.find();
            let ZeroCardData = [];
            GetZeroCardData?.forEach((val)=>{
                let tempObj = {
                    _id : null,
                    card_id : val?._id,
                    card_image : val?.cardImage,
                    card_name : val?.cardName,
                    sess_user_id : null,
                    curr_sess_is : currSessData?._id,
                    total_bet : 0,
                    total_users : 0
                }

                ZeroCardData = [...ZeroCardData, tempObj];
            });
            CardListData = [...CardListData, ...ZeroCardData];
         }

         
         return res.status(200).json(new ApiResponse(200,"Current Session List Request!",CardListData,"Fetch Data Successfully."))
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Current Session List Request!",error?.message,error));
        // throw new ApiError(500,"Role List Request!", error?.message,error);
    }
}

export const StartCurrentSessionTime = async (req,res) => {
    try {
        let userId = req?.user?._id;

        const GameStartTimeData = await Game_start_time.findOne({ status : 'Active' }).select('timeInMin');
        const addTimeInMin = GameStartTimeData?.timeInMin > 0 ? GameStartTimeData?.timeInMin : 60;

        const now = new Date();
        // const end = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
        const end = new Date(now.getTime() + addTimeInMin * 60 * 1000); // 1 hour later

        if(!userId){
            return res.status(500).json(new ApiError(500,"Current Session Start Request!",'Invalid Admin!'));
        }

        const isPrevSessionActive = await Current_session.findOne({ isActive : true });
        if(isPrevSessionActive){
            return res.status(500).json(new ApiError(500,"Current Session Start Request!",'Already Session is Started.!'));
        }
        
       const session = await Current_session.create({
            current_session_id: "session_" + now.getTime(),
            current_session_name: `session_${Date.now()}`,
            startTime: now,
            endTime: end,
            startBy: new mongoose.Types.ObjectId(userId),
            isActive: true,
            status : 'Active',
            isDeleted : 0
        });

        _io.emit("session_started", {
            endTime: session.endTime,
            startTime: session.startTime,
            sessionId: session.current_session_id,
            isActive: session.isActive
        });
       
        return res.status(200).json(new ApiResponse(200,"Current Session Start Request!",[],"Session Start Successfully."));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Current Session Start Request!",error?.message,error));
        // throw new ApiError(500,"Manage Role Request!", error?.message,error);
    }
}

export const StopCurrentSessionTime = async (req,res) => {
    try {
         const sessionId = req?.params?.session_id;

         const sessionData = await Current_session?.findById(sessionId);

         if(!sessionData){
               return res.status(500).json(new ApiError(500,"Stop Current Session Request!",error?.message,error));
         }

         sessionData.isActive = false;
         sessionData.status = "Suspended";

         _io.emit("session_started", {
            endTime: sessionData.endTime,
            startTime: sessionData.startTime,
            sessionId: sessionData.current_session_id,
            isActive : sessionData.isActive
         });

         StartCardRevealTime(req?.user?._id);

         if(sessionData?.save()){
             return res.status(200).json(new ApiResponse(200,"Stop Current Session Request!",[],"Stop Current Session Successfully."))
         }else{
            return res.status(500).json(new ApiError(500,"Stop Current Session Request!",'Something Went Wrong.'));
         }

    } catch (error) {
        return res.status(500).json(new ApiError(500,"Stop Current Session Request!",error?.message,error));
        // throw new ApiError(500,"Role List Request!", error?.message,error);
    }
}

export const DeleteCurrentSessionTime = async (req,res) => {
    try {        
        let sessionId = req?.params?.id;
        if(!sessionId){
            return res.status(200).json(new ApiError(400,"Delete Current Session Request!","Please provide sessionId."));
        }
        let isActive = await Current_session.findById(sessionId);

        if(isActive?.isActive){
            return res.status(200).json(new ApiError(404,"Delete Current Session Request!","This Session Already in Use."));
        }
        
        let deleteSession = await Current_session.findByIdAndDelete(sessionId);
        if (!deleteSession) {
            return res.status(200).json(new ApiError(404,"Delete Current Session Request!","No Current Session Exist For This sessionId."));
        }    
        
        return res.status(200).json(new ApiResponse(200,"Delete Current Session Request!",[],"Delete Data Successfully."));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Delete Current Session Request!",error?.message,error));
        // throw new ApiError(500,"Delete Current Session Request!", error?.message,error);
    }
}

export const RevealCardJOLD = async (req,res) => {
    let session = await dbTransactions.startSession();
    try {
         session.startTransaction();
         const currSessId = req?.body?.sess_user_id;
         const cardId = req?.body?.card_id;
         const totalBetAmt = req?.body?.total_bet_amt;
         const sess_id = req?.body?.sess_id;

         //Create Reveal Card Data Start
         const currSessUser = await Current_bet_by_user.findById(currSessId).session(session);
         
         let currSessData = {};
         if(currSessId && totalBetAmt > 0){
              currSessData = await Current_session.findById(currSessUser?.current_session_id).session(session);
         }else{
              currSessData = await Current_session.findById(sess_id).session(session);
         }

        //  console.log("currSessData", currSessData);
         let isWinCardExists = await Winning_card.findOne({sess_id :  currSessData?._id, card_id : cardId}).session(session);

         if(isWinCardExists){
            return res.status(200).json(new ApiError(200,"Reaveal Card Request!","Card Already Reaveal."));            
         }

         await Winning_card.create([{
            sess_id : currSessData?._id,
            card_id : cardId,
            total_bet_amt : totalBetAmt
         }],{ session }); 
         //Create Reveal Card Data End

         let looseAdminAmt = 0;     // for Admin History
         let mutiply_amt = 0;  // for Admin History
         let totalLooseAdminAmt = 0;  // for Admin History
         let winnigAdminAmt = 0;  // for Admin History

         //Winning User Process Start  
            const GetWinUserIds = await Current_bet_on_card.aggregate([
                // 1. Match card
                {
                    $match: { card_id: new ObjectId(cardId) }
                },
                // 2. Lookup to get user data from Current_bet_by_user
                {
                    $lookup: {
                        from: "current_bet_by_users", // 👈 collection name in MongoDB (not model)
                        localField: "sess_user_id",
                        foreignField: "_id",
                        as: "userData"
                    }
                },
                // 3. Unwind userData to flatten array
                {
                    $unwind: "$userData"
                },
                // 4. Project only user_id
                {
                    $project: { _id: 0, user_id: "$userData.user_id" }
                },
                // Optional: Group all user_ids into one array (if you want array)
                {
                    $group: { _id: null, user_ids: { $addToSet: "$user_id" } }
                }
            ]).session(session);

            let winningUserIds = GetWinUserIds?.[0]?.user_ids;
            // console.log("winningUserIds--->", winningUserIds)

            if(winningUserIds?.length > 0){
                for(const val of winningUserIds){
                    let tempCurrSessData = await Current_bet_by_user.findOne({ user_id : val, current_session_id : currSessData }).session(session);
                    let temCurrBetCardData = await Current_bet_on_card.findOne({ card_id : new ObjectId(cardId), sess_user_id : tempCurrSessData?._id }).session(session);

                    // console.log("temCurrBetCardData--->",temCurrBetCardData);

                    let winUserAmt = temCurrBetCardData?.bet_amt;
                    let totalWinUserAmt = (temCurrBetCardData?.bet_amt * temCurrBetCardData?.mutiplyBy);
                        looseAdminAmt += temCurrBetCardData?.bet_amt;                
                        mutiply_amt = temCurrBetCardData?.mutiplyBy;
                        // console.log("looseAdminAmt--->",looseAdminAmt)
                        // console.log("totalWinUserAmt--->",winUserAmt, mutiply_amt, totalWinUserAmt)
                    let tempUserData = await User_master.findById(val).session(session);
                        tempUserData.wallet_amt = totalWinUserAmt > 0 ? (tempUserData.wallet_amt + totalWinUserAmt) : tempUserData.wallet_amt;
                        await tempUserData.save({ session });

                        
                        let winUserObj = {
                            sess_id : currSessData?._id,
                            userId : val,
                            cardId : cardId,
                            bet_amt : winUserAmt,
                            mutiplyBy : mutiply_amt,
                            total_bet_amt : totalWinUserAmt,
                        }
                        await Winning_user_history.create([winUserObj],{ session });
                };
                totalLooseAdminAmt = (looseAdminAmt * mutiply_amt);
                // console.log("totalLooseAdminAmt--->",looseAdminAmt, totalLooseAdminAmt);

            }
         //Winning User Process End

         //Loose User Process Start
            const GetLooseUserIds = await Current_bet_on_card.aggregate([
                // 1. Match card
                {
                    $match: { card_id: { $ne : new ObjectId(cardId) } }
                },
                // 2. Lookup to get user data from Current_bet_by_user
                {
                    $lookup: {
                        from: "current_bet_by_users", // 👈 collection name in MongoDB (not model)
                        localField: "sess_user_id",
                        foreignField: "_id",
                        as: "userData"
                    }
                },
                // 3. Unwind userData to flatten array
                {
                    $unwind: "$userData"
                },
                // 4. Project only user_id
                {
                    $project: { _id: 0, user_id: "$userData.user_id" }
                },
                // Optional: Group all user_ids into one array (if you want array)
                {
                    $group: { _id: null, user_ids: { $addToSet: "$user_id" } }
                }
            ]).session(session);
            
            let looseUserIds = GetLooseUserIds?.[0]?.user_ids;
            if(looseUserIds?.length > 0){
                for(const val of looseUserIds){
                    let tempUserData = await User_master.findById(val).session(session);
                    let tempCurrSessData = await Current_bet_by_user.findOne({ user_id : val, current_session_id : currSessData }).session(session);
                    let temCurrBetCardData = await Current_bet_on_card.find({ card_id: { $ne : new ObjectId(cardId) } , sess_user_id : tempCurrSessData?._id }).session(session);
                    if(temCurrBetCardData?.length > 0){
                        let totalLooseUserAmt = 0;
                        temCurrBetCardData?.forEach(async (cardVal)=>{
                            totalLooseUserAmt += cardVal?.bet_amt > 0 ? cardVal?.bet_amt : 0;                            
                            winnigAdminAmt += cardVal?.bet_amt > 0 ? cardVal?.bet_amt : 0;

                            let looseUserObj = {
                                sess_id : currSessData?._id,
                                userId : val,
                                cardId : cardVal?.card_id,
                                bet_amt : cardVal?.bet_amt,
                                mutiplyBy :cardVal?.mutiplyBy
                            }
                            await Loose_user_history.create([looseUserObj],);
                        })  
                        tempUserData.wallet_amt = totalLooseUserAmt > 0 ? (tempUserData.wallet_amt - totalLooseUserAmt) : tempUserData.wallet_amt;
                        await tempUserData.save({ session });                      
                    }
                };
            }
         //Loose User Process End

         let totalUser = [];
             totalUser = (winningUserIds?.length > 0) ? [...winningUserIds] : [];
             totalUser = (looseUserIds?.length > 0) ? [...looseUserIds] : [];

         const uniqueUserIds = [
            ...new Map(totalUser.map(id => [id.toString(), id])).values()
         ];

        //  console.log("totalUser",uniqueUserIds)

         //Admin Account Process Start
         await Admin_account_history.create([
            {
                sess_name : currSessData?.current_session_name, 
                sess_id : currSessData?._id, 
                total_users : uniqueUserIds?.length, 
                win_amt : winnigAdminAmt, 
                loose_amt : looseAdminAmt, 
                mutiplyBy : mutiply_amt, 
                total_loose_amt : totalLooseAdminAmt
            }
         ],{ session })
         //Admin Account Process End
         
         //Create Old Session Data Start
         let currSessObj = {
            old_id : currSessData?._id,
            current_session_id : currSessData?.current_session_id,
            current_session_name : currSessData?.current_session_name,
            startTime : currSessData?.startTime || '',
            endTime : currSessData?.endTime || '',
            startBy : currSessData?.startBy || null,
            endBy : currSessData?.endBy || null
         }

         await Old_session.create([currSessObj],{ session });
         await Current_session.deleteMany({}, { session });
         //Create Old Session Data End

         //Create Old Bet by User Data Start
         let currenBetByUserData = await Current_bet_by_user.find();

         if(currenBetByUserData){
            for(const value of currenBetByUserData){
                let currBetCardObj = {
                    old_id : value?._id,
                    current_session_id : new ObjectId(value?.current_session_id),
                    user_id : value?.user_id
                }
                 await Old_bet_by_user.create([currBetCardObj],{ session });
            }
            await Current_bet_by_user.deleteMany({}, { session });
         }
         //Create Old Bet by User Data End

         //Create Old Bet On Card Data Start
         let currenBetOnCardData = await Current_bet_on_card.find();

         if(currenBetOnCardData){
            for(const value of currenBetOnCardData){
                let currBetCardObj = {
                    old_id : value?._id,
                    sess_user_id : value?.sess_user_id,
                    card_id : value?.card_id,
                    bet_amt : value?.bet_amt,
                    mutiplyBy : value?.mutiplyBy
                }
                 await Old_bet_on_card.create([currBetCardObj],{ session });
            }
            await Current_bet_on_card.deleteMany({}, { session });
         }
         //Create Old Bet On Card Data End


         await session.commitTransaction();
         return res.status(200).json(new ApiResponse(200,"Reaveal Card Request!",[],"Set Winning Card Successfully."))
    } catch (error) {
         await session.abortTransaction();
         Log.error(`Con::curren_session(RevealCard) : ${error?.message}`)
         return res.status(500).json(new ApiError(500,"Reaveal Card Request!",error?.message,error));
        // throw new ApiError(500,"Role List Request!", error?.message,error);
    } finally {
        await session.endSession();
    }
}


export const RevealCard = async (req,res) => {
    let session = await dbTransactions.startSession();
    try {
         session.startTransaction();
         const currSessId = req?.body?.sess_user_id;
         const cardId = req?.body?.card_id;
         const totalBetAmt = req?.body?.total_bet_amt;
         const sess_id = req?.body?.sess_id;

         //Create Reveal Card Data Start
         const currSessUser = await Current_bet_by_user.findById(currSessId).session(session);
         
         let currSessData = {};
         if(currSessId && totalBetAmt > 0){
              currSessData = await Current_session.findById(currSessUser?.current_session_id).session(session);
         }else{
              currSessData = await Current_session.findById(sess_id).session(session);
         }

        //  console.log("currSessData", currSessData);
         let isWinCardExists = await Winning_card.findOne({sess_id :  currSessData?._id, card_id : cardId}).session(session);

         if(isWinCardExists){
            return res.status(200).json(new ApiError(200,"Reaveal Card Request!","Card Already Reaveal."));            
         }

         await Winning_card.create([{
            sess_id : currSessData?._id,
            card_id : cardId,
            total_bet_amt : totalBetAmt
         }],{ session }); 
         //Create Reveal Card Data End

        await SetDataAfterRevealCard(session, currSessData?._id, cardId, currSessData);
        
         await session.commitTransaction();
         return res.status(200).json(new ApiResponse(200,"Reaveal Card Request!",[],"Set Winning Card Successfully."))
    } catch (error) {
         await session.abortTransaction();
         Log.error(`Con::curren_session(RevealCard) : ${error?.message}`)
         return res.status(500).json(new ApiError(500,"Reaveal Card Request!",error?.message,error));
        // throw new ApiError(500,"Role List Request!", error?.message,error);
    } finally {
        await session.endSession();
    }
}

export const RevealCardAuto = async (req, res) => {
        let session = await dbTransactions.startSession();
    try {
         session.startTransaction();
        const currentSessData = await Current_session.findOne({ isActive : true });
        const currentSessId = currentSessData?._id;

        if(!currentSessData){
            Log.info('Con:current_session(RevealCardAuto): Current Session Data Not Found.')
            return res.status(200).json(new ApiResponse(200,"Reaveal Card Request!",[],"Current Session Data Not Found."));
        }

        let existingBetCardData = await Current_bet_on_card.aggregate([
                                    {
                                        $group : {
                                            _id : "$card_id",
                                            total_bet_amt : {
                                                $sum : "$bet_amt"
                                            },
                                            card_id : { $first : "$card_id" }
                                        }    
                                    },
                                    {
                                        $sort : { total_bet_amt : -1 }
                                    },
                                    {
                                        $project : { _id : 0 }
                                    }
                                ]);

        let existingCardIds = existingBetCardData?.map(O=>O?.card_id);

        let notExistingCardData = await Card.find({ _id : { $nin :existingCardIds } });
        
            notExistingCardData = notExistingCardData ? notExistingCardData?.map(O=>({ card_id : O?._id , total_bet_amt : 0 })) : [];

        let allBetCardData = [...existingBetCardData, ...notExistingCardData];

        // let betCardData = allBetCardData
        const halfIndex = Math.floor(allBetCardData?.length / 2);
        const secondHalfCardData = allBetCardData.slice(halfIndex);

        const lowestBetCard = secondHalfCardData.reduce((lowest, card) => {
            return card.total_bet_amt < lowest.total_bet_amt ? card : lowest;
        });

         const cardId = lowestBetCard?.card_id;
         const totalBetAmt = lowestBetCard?.total_bet_amt;

         let isWinCardExists = await Winning_card.findOne({sess_id :  currentSessId, card_id : cardId }).session(session);

         if(isWinCardExists){
            return res.status(200).json(new ApiError(200,"Reaveal Card Request!","Card Already Reaveal."));            
         }

        await Winning_card.create([{
            sess_id : currentSessId,
            card_id : cardId,
            total_bet_amt : totalBetAmt
         }],{ session }); 

        await SetDataAfterRevealCard(session, currentSessId, cardId, currentSessData);

        await session.commitTransaction();
        return res.status(200).json(new ApiResponse(200,"Reaveal Card Request!",[],"Set Winning Card Successfully."))
    } catch (error) {
        await session.abortTransaction();
        Log.error(`Con::curren_session(RevealCardAuto) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Reaveal Card Request!",error?.message,error));
    } finally {
        await session.endSession();
    }
    
}

const SetDataAfterRevealCard = async (session, currentSessId, cardId, currSessData) => {
    let looseAdminAmt = 0;     // for Admin History
    let mutiply_amt = 0;  // for Admin History
    let totalLooseAdminAmt = 0;  // for Admin History
    let winnigAdminAmt = 0;  // for Admin History

    //Winning User Process Start  
    const GetWinUserIds = await Current_bet_on_card.aggregate([
        // 1. Match card
        {
            $match: { card_id: new ObjectId(cardId) }
        },
        // 2. Lookup to get user data from Current_bet_by_user
        {
            $lookup: {
                from: "current_bet_by_users", // 👈 collection name in MongoDB (not model)
                localField: "sess_user_id",
                foreignField: "_id",
                as: "userData"
            }
        },
        // 3. Unwind userData to flatten array
        {
            $unwind: "$userData"
        },
        // 4. Project only user_id
        {
            $project: { _id: 0, user_id: "$userData.user_id" }
        },
        // Optional: Group all user_ids into one array (if you want array)
        {
            $group: { _id: null, user_ids: { $addToSet: "$user_id" } }
        }
    ]).session(session);

    let winningUserIds = GetWinUserIds?.[0]?.user_ids;
    // console.log("winningUserIds--->", winningUserIds)

    if(winningUserIds?.length > 0){
        for(const val of winningUserIds){
            let tempCurrSessData = await Current_bet_by_user.findOne({ user_id : val, current_session_id : currentSessId }).session(session);
            let temCurrBetCardData = await Current_bet_on_card.findOne({ card_id : new ObjectId(cardId), sess_user_id : tempCurrSessData?._id }).session(session);

            // console.log("temCurrBetCardData--->",temCurrBetCardData);

            let winUserAmt = temCurrBetCardData?.bet_amt;
            let totalWinUserAmt = (temCurrBetCardData?.bet_amt * temCurrBetCardData?.mutiplyBy);
                looseAdminAmt += temCurrBetCardData?.bet_amt;                
                mutiply_amt = temCurrBetCardData?.mutiplyBy;
                // console.log("looseAdminAmt--->",looseAdminAmt)
                // console.log("totalWinUserAmt--->",winUserAmt, mutiply_amt, totalWinUserAmt)
            let tempUserData = await User_master.findById(val).session(session);

                await User_wallet_history.create([{
                    user_id : tempUserData?._id,
                    prev_amount : tempUserData?.wallet_amt,
                    amount : totalWinUserAmt,
                    total_amount : (tempUserData?.wallet_amt + totalWinUserAmt),
                    wallet_type : 'credited',
                    description : `Your wallet has been credited by ₹${totalWinUserAmt}`,
                }],{session});

                tempUserData.wallet_amt = totalWinUserAmt > 0 ? (tempUserData.wallet_amt + totalWinUserAmt) : tempUserData.wallet_amt;
                await tempUserData.save({ session });                
                
                let winUserObj = {
                    sess_id : currentSessId,
                    userId : val,
                    cardId : cardId,
                    bet_amt : winUserAmt,
                    mutiplyBy : mutiply_amt,
                    total_bet_amt : totalWinUserAmt,
                }
                await Winning_user_history.create([winUserObj],{ session });
        };
        totalLooseAdminAmt = (looseAdminAmt * mutiply_amt);
        // console.log("totalLooseAdminAmt--->",looseAdminAmt, totalLooseAdminAmt);

    }
    //Winning User Process End

    //Loose User Process Start
    const GetLooseUserIds = await Current_bet_on_card.aggregate([
        // 1. Match card
        {
            $match: { card_id: { $ne : new ObjectId(cardId) } }
        },
        // 2. Lookup to get user data from Current_bet_by_user
        {
            $lookup: {
                from: "current_bet_by_users", // 👈 collection name in MongoDB (not model)
                localField: "sess_user_id",
                foreignField: "_id",
                as: "userData"
            }
        },
        // 3. Unwind userData to flatten array
        {
            $unwind: "$userData"
        },
        // 4. Project only user_id
        {
            $project: { _id: 0, user_id: "$userData.user_id" }
        },
        // Optional: Group all user_ids into one array (if you want array)
        {
            $group: { _id: null, user_ids: { $addToSet: "$user_id" } }
        }
    ]).session(session);
    
    let looseUserIds = GetLooseUserIds?.[0]?.user_ids;
    if(looseUserIds?.length > 0){
        for(const val of looseUserIds){
            let tempUserData = await User_master.findById(val).session(session);
            let tempCurrSessData = await Current_bet_by_user.findOne({ user_id : val, current_session_id : currentSessId }).session(session);
            let temCurrBetCardData = await Current_bet_on_card.find({ card_id: { $ne : new ObjectId(cardId) } , sess_user_id : tempCurrSessData?._id }).session(session);
            if(temCurrBetCardData?.length > 0){
                let totalLooseUserAmt = 0;
                temCurrBetCardData?.forEach(async (cardVal)=>{
                    totalLooseUserAmt += cardVal?.bet_amt > 0 ? cardVal?.bet_amt : 0;                            
                    winnigAdminAmt += cardVal?.bet_amt > 0 ? cardVal?.bet_amt : 0;

                    let looseUserObj = {
                        sess_id : currentSessId,
                        userId : val,
                        cardId : cardVal?.card_id,
                        bet_amt : cardVal?.bet_amt,
                        mutiplyBy :cardVal?.mutiplyBy
                    }
                    await Loose_user_history.create([looseUserObj],);
                }); 

                await User_wallet_history.create([{
                    user_id : tempUserData?._id,
                    prev_amount : tempUserData?.wallet_amt,
                    amount : totalLooseUserAmt,
                    total_amount : (tempUserData?.wallet_amt - totalLooseUserAmt),
                    wallet_type : 'debited',
                    description : `Your wallet has been debited by ₹${totalLooseUserAmt}`,
                }],{session}); 

                tempUserData.wallet_amt = totalLooseUserAmt > 0 ? (tempUserData.wallet_amt - totalLooseUserAmt) : tempUserData.wallet_amt;
                await tempUserData.save({ session }); 
                                    
            }
        };
    }
    //Loose User Process End

    let totalUser = [];
        totalUser = (winningUserIds?.length > 0) ? [...winningUserIds] : [];
        totalUser = (looseUserIds?.length > 0) ? [...looseUserIds] : [];

    const uniqueUserIds = [
    ...new Map(totalUser.map(id => [id.toString(), id])).values()
    ];

//  console.log("totalUser",uniqueUserIds)

    //Admin Account Process Start
    await Admin_account_history.create([
    {
        sess_name : currSessData?.current_session_name, 
        sess_id : currSessData?._id, 
        total_users : uniqueUserIds?.length, 
        win_amt : winnigAdminAmt, 
        loose_amt : looseAdminAmt, 
        mutiplyBy : mutiply_amt, 
        total_loose_amt : totalLooseAdminAmt
    }
    ],{ session })
    //Admin Account Process End
    
    //Create Old Session Data Start
    let currSessObj = {
        old_id : currSessData?._id,
        current_session_id : currSessData?.current_session_id,
        current_session_name : currSessData?.current_session_name,
        startTime : currSessData?.startTime || '',
        endTime : currSessData?.endTime || '',
        startBy : currSessData?.startBy || null,
        endBy : currSessData?.endBy || null
    }

    await Old_session.create([currSessObj],{ session });
    await Current_session.deleteMany({}, { session });
    //Create Old Session Data End

    //Create Old Bet by User Data Start
    let currenBetByUserData = await Current_bet_by_user.find();

    if(currenBetByUserData){
    for(const value of currenBetByUserData){
        let currBetCardObj = {
            old_id : value?._id,
            current_session_id : new ObjectId(value?.current_session_id),
            user_id : value?.user_id
        }
            await Old_bet_by_user.create([currBetCardObj],{ session });
    }
    await Current_bet_by_user.deleteMany({}, { session });
    }
    //Create Old Bet by User Data End

    //Create Old Bet On Card Data Start
    let currenBetOnCardData = await Current_bet_on_card.find();

    if(currenBetOnCardData){
    for(const value of currenBetOnCardData){
        let currBetCardObj = {
            old_id : value?._id,
            sess_user_id : value?.sess_user_id,
            card_id : value?.card_id,
            bet_amt : value?.bet_amt,
            mutiplyBy : value?.mutiplyBy
        }
            await Old_bet_on_card.create([currBetCardObj],{ session });
    }
    await Current_bet_on_card.deleteMany({}, { session });
    }
    //Create Old Bet On Card Data End
}

const StartCardRevealTime = async (userId) => {
    const CardTimeData = await Card_reveal_time.findOne();
    const CardTime = CardTimeData?.timeInMin > 0 ? parseInt(CardTimeData?.timeInMin) : 15;
    const startTime = new Date();
    const endTime = startTime.setMinutes(startTime.getMinutes() + CardTime);
    console.log("startTime",startTime)
    console.log("endTime",endTime)
    console.log("startBy",userId)
    const data = await Current_card_reveal_time.create({
                    startTime : startTime,
                    endTime : endTime,
                    startBy : userId,
                    isActive : true
                });

    _io.emit("card_reveal_session_started", {
        endTime: data.endTime,
        startTime: data.startTime,
        isActive : data.isActive
    });
}

export const PredicCardCalculation = async (req, res) => {
    try {
        const cardId = req?.body?.card_id;
        const multilplyAmt = await MultiplyAmt.findOne();
        const CardInData = await Current_bet_on_card.aggregate([
            {
                $match : { card_id : new ObjectId(cardId) }
            },
            {
                $group : {
                    _id : '$card_id',
                    total_bet_amt : { $sum : '$bet_amt'}
                }
            }
        ]);

        const CardOutData = await Current_bet_on_card.aggregate([
            {
                $match : { card_id : { $ne : new ObjectId(cardId) } }
            },
            {
                $group : {
                    _id : null,
                    total_bet_amt : { $sum : '$bet_amt'}
                }
            }
        ]);
        const result = { 
            CardInTotalAmt : CardInData?.[0]?.total_bet_amt > 0  ? CardInData?.[0]?.total_bet_amt : 0 ,
            CardOutTotalAmt : CardOutData?.[0]?.total_bet_amt > 0  ? CardOutData?.[0]?.total_bet_amt : 0 ,
            mutiplyByAmt : multilplyAmt?.multiply_amount > 0 ? multilplyAmt?.multiply_amount : 1
        }
        return res.status(200).json(new ApiResponse(200,"Predict Card Calculation Request!",result,"Fetch Data Successfully."));        
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Predict Card Calculation Request!",error?.message,error));        
    }
}
