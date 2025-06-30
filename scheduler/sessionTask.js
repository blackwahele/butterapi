import mongoose from "mongoose";
import User_master from "../models/admin/user.model.js";
import Card from "../models/admin/card.model.js";
import Current_session from "../models/current_session.model.js";
import Current_bet_on_card from "../models/user/current_bet_card.model.js";
import Current_bet_by_user from "../models/user/current_bet_user.model.js";
import Winning_card from "../models/admin/winning_card.model.js";
import Card_reveal_time from "../models/card_reveal_time.model.js";
import Current_card_reveal_time from "../models/current_card_reveal_time.model.js";

import User_wallet_history from "../models/user/user_wallet_history.model.js";
import Winning_user_history from "../models/admin/winning_user_history.model.js";

import Old_session from "../models/old_session.model.js";
import Old_bet_by_user from "../models/user/old_bet_user.model.js";
import Old_bet_on_card from "../models/user/old_bet_card.model.js";
import Admin_account_history from "../models/admin/admin_account_history.model.js";
import Next_game_start_in from "../models/next_game_start_in.model.js";
import Next_game_time from "../models/next_game_time.model.js";
import Game_start_time from "../models/game_start_time.model.js";
import Loose_user_history from "../models/admin/loose_user_history.model.js";
import Game_mode from "../models/game_mode.model.js";

import Log from "../utils/logger.js";
import { ConnectDB } from "../database/connectionDB.js";
import dbTransactions from "../database/connectionDB.js";
import MultiplyAmt from "../models/admin/multiply_amt.model.js";
const { ObjectId } = mongoose.Types;

//Stop Game Timer and Set Card Reveal Time Logic
export const AutoSetCardRevealTime = async () => {
        // await ConnectDB();
        let session = await dbTransactions.startSession();
        try {
            session.startTransaction();
            const CurrentSessData = await Current_session.findOne({isActive : true}).select('current_session_id current_session_name startTime endTime isActive').session(session);
            const currentSessId = CurrentSessData?._id;
            // console.log('CurrentSessData',CurrentSessData)
            if(CurrentSessData?.isActive){
                const startTime = new Date(CurrentSessData?.startTime).getTime();
                const endTime = new Date(CurrentSessData?.endTime).getTime();
                const now = new Date().getTime();
                const diffTime = endTime - now;              
                 if(diffTime <= 0){
                        const CardRevelTimeData = await Card_reveal_time.findOne({ status : 'Active'}).select('timeInMin').session(session);
                        const addTimeInMin = CardRevelTimeData?.timeInMin > 0 ? CardRevelTimeData?.timeInMin : 30;

                        const initalTime = new Date();
                        const afterTime = new Date(initalTime.getTime() + addTimeInMin * 60 * 1000);
                        await Current_card_reveal_time.create([{
                            startTime : initalTime,
                            endTime : afterTime,
                            startBy : new ObjectId('68464e01af244e078b00a870'),
                            isActive : true
                        }],{ session });

                        CurrentSessData.isActive = false;
                        CurrentSessData.status = 'Suspended';
                  await CurrentSessData.save( { session } );

                        _io.emit("card_reveal_timer_start");

                        // _io.emit("start_card_reveal_time", {
                        //     endTime: CurrentSessData.endTime,
                        //     startTime: CurrentSessData.startTime,
                        //     sessionId: CurrentSessData.current_session_id,
                        //     isActive : CurrentSessData.isActive
                        // });

                        await session.commitTransaction();                       
                 }
            }

        } catch (error) {
            await session.abortTransaction();
            Log.error(`Sheduler::sessionTask(AutoSetCardRevealTime) --> ${error?.message}`)
            console.log('error--->',error.message) 
        } finally {
            await session.endSession();
        }   
}

//Set Winnig Card and Set Next Game Start Logic 
export const AutoCardReveal = async () => {
    // await ConnectDB();
    let session = await dbTransactions.startSession();
    try {
        session.startTransaction();
        const CurrRevealTime = await Current_card_reveal_time.findOne({isActive : true}).select('startTime endTime isActive').session(session);
        const CurrentSessData = await Current_session.findOne({isActive : false}).select('current_session_id current_session_name startTime endTime isActive').session(session);
        const NextGameStartTime = await Next_game_start_in.findOne({isActive : true}).select('startTime endTime isActive').session(session);

        // console.log('CurrentSessData--->',CurrentSessData);
        const currentSessId = CurrentSessData?._id;  
            
        if(!CurrentSessData?.isActive && CurrRevealTime?.isActive && NextGameStartTime == null){
            const startTime = new Date(CurrRevealTime?.startTime).getTime();
            const endTime = new Date(CurrRevealTime?.endTime).getTime();
            const now = new Date().getTime();
            const diffTime = endTime - now;
            // console.log("diffTime", diffTime)
            if(diffTime <= 0){
                let BetOnCardData = await Current_bet_on_card.aggregate([
                                        {
                                            $group: {
                                                    _id: "$card_id",
                                                    total_bet_amt : { $sum: "$bet_amt" },
                                                    uniqueUsers: { $addToSet: "$sess_user_id" },
                                                    card_id : { $first : "$card_id" }
                                                }
                                            },
                                            {
                                                $sort : { total_bet_amt : -1 }
                                            },                                        
                                            {
                                                $project: {
                                                    _id: 1,
                                                    total_bet_amt : 1,
                                                    totalUsers: { $size: "$uniqueUsers" },
                                                    card_id : 1,                                                
                                                }
                                            }
                                    ]).session(session);
                // console.log("BetOnCardData--->",BetOnCardData)
                let existingCardIds = BetOnCardData?.map(O=>O?.card_id);

                let notExistingCardData = await Card.find({ _id : { $nin :existingCardIds } }).select("_id");
                    notExistingCardData = notExistingCardData ? notExistingCardData?.map(O=>({ card_id : O?._id , total_bet_amt : 0, totalUsers : 0 })) : [];
                let allBetCardData = [...BetOnCardData, ...notExistingCardData];     

                // console.log("existingCardIds--->",existingCardIds)
                // console.log("notExistingCardData--->",notExistingCardData)
                // console.log("allBetCardData--->",allBetCardData)
                console.log("allBetCardData--->",allBetCardData?.length)

                const halfIndex = Math.floor(allBetCardData?.length / 2);
                const secondHalfCardData = allBetCardData.slice(halfIndex);

                const lowestBetCard = secondHalfCardData.reduce((lowest, card) => {
                    return card.total_bet_amt < lowest.total_bet_amt ? card : lowest;
                });

                const cardId = lowestBetCard?.card_id;
                const totalBetAmt = lowestBetCard?.total_bet_amt;
                const totalUsers = lowestBetCard?.totalUsers;
            
                const isWinCardExists = await Winning_card.findOne({sess_id :  currentSessId, card_id : cardId }).session(session);

                if(isWinCardExists){
                    Log.error(`Sheduler::sessionTask(AutoCardReveal) --> Card Already Reaveal.`)
                    return false;            
                }else{
                    await Winning_card.create([{
                        sess_id : currentSessId,
                        card_id : cardId,
                        total_bet_amt : totalBetAmt,
                        total_users : totalUsers
                    }],{ session }); 

                    await SetDataAfterRevealCard(session,currentSessId, cardId, CurrentSessData);

                     _io.emit("next_game_timer_start");
                }
            }
        }   
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        Log.error(`Sheduler::sessionTask(AutoCardReveal) --> ${error?.message}`)
        console.log('error--->',error.message)        
    } finally {
        await session.endSession();
    }   
}

//Stop Next Game Start in Timer and Start New Game Timer Logic
export const AutoStartNewGameTime = async () => {
    // await ConnectDB();
    let session = await dbTransactions.startSession();
    try {
        session.startTransaction();
        const CurrRevealTime = await Current_card_reveal_time.findOne({isActive : true}).select('startTime endTime isActive').session(session);
        const NextGameStartTime = await Next_game_start_in.findOne({isActive : true}).select('startTime endTime isActive').session(session);
        const CurrentSession = await Current_session.find().session(session);

        const GameStartTimeData = await Game_start_time.findOne({ status : 'Active' }).select('timeInMin').session(session);
        const addTimeInMin = GameStartTimeData?.timeInMin > 0 ? GameStartTimeData?.timeInMin : 60;

        const currentTime = new Date();
        // const endTime = new Date(now.getTime() + 60 * 60 * 1000);  //for 1 hours
        // const endTime = new Date(now.getTime() + 1 * 60 * 1000);  //for 1 min
        const endTime = new Date(currentTime.getTime() + addTimeInMin * 60 * 1000);  

        if(CurrentSession?.length == 0 && NextGameStartTime?.isActive){
            const initalTime = new Date().getTime();
            // const startTime = new Date(NextGameStartTime?.startTime).getTime();
            const stopTime = new Date(NextGameStartTime?.endTime).getTime();
            const diffTime = stopTime - initalTime;             

            if(diffTime <= 0){
                await Current_session.create([{
                    current_session_id: "session_" + currentTime.getTime(),
                    current_session_name: `session_${Date.now()}`,
                    startTime: currentTime,
                    endTime: endTime,
                    startBy: new ObjectId('68464e01af244e078b00a870'),
                    isActive: true,
                    status : 'Active',
                    isDeleted : 0                   
                }],{ session });
                await Next_game_start_in.deleteMany({}, { session });
                await session.commitTransaction();
                 _io.emit("new_game_timer_start");
            }
        }else if(CurrentSession?.length == 0 && !CurrRevealTime){               
            await Current_session.create([{
                    current_session_id: "session_" + currentTime.getTime(),
                    current_session_name: `session_${Date.now()}`,
                    startTime: currentTime,
                    endTime: endTime,
                    startBy: new ObjectId('68464e01af244e078b00a870'),
                    isActive: true,
                    status : 'Active',
                    isDeleted : 0                   
            }],{ session });
            await session.commitTransaction();
            _io.emit("new_game_timer_start");
        }
        
    } catch (error) {
        await session.abortTransaction();
        Log.error(`Sheduler::sessionTask(AutoStartNewGameTime) --> ${error?.message}`)
        console.log('error--->',error.message)    
    } finally {
        await session.endSession();
    }   
}

const SetDataAfterRevealCard = async (session, currentSessId, cardId, currSessData) => {
    let looseAdminAmt = 0;     // for Admin History
    let mutiply_amt = 0;  // for Admin History
    let totalLooseAdminAmt = 0;  // for Admin History
    let winnigAdminAmt = 0;  // for Admin History
    let multiply_amount = 2;

    const multiplyAmtData = MultiplyAmt.find({ status : 'Active'}).sort({ multiply_amount : 1 });
    if(multiplyAmtData?.length > 0){
        multiply_amount = multiplyAmtData?.multiply_amount > 0 ? multiplyAmtData?.multiply_amount : 2;
    }

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
            // let totalWinUserAmt = (temCurrBetCardData?.bet_amt * temCurrBetCardData?.mutiplyBy);
            let totalWinUserAmt = (temCurrBetCardData?.bet_amt * multiply_amount);
                looseAdminAmt += temCurrBetCardData?.bet_amt;                
                // mutiply_amt = temCurrBetCardData?.mutiplyBy;
                
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
                        // mutiplyBy :cardVal?.mutiplyBy
                        mutiplyBy : multiply_amount
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

    //Delete Current Card Reveal Time Start
        await Current_card_reveal_time.deleteMany({}, { session });
    //Delete Current Card Reveal Time End

    //Set Next Game Start In Start
    const NextGameTimeData = await Next_game_time.findOne({ status : 'Active'}).select('timeInMin').session(session);
    const addTimeInMin = NextGameTimeData?.timeInMin > 0 ? NextGameTimeData?.timeInMin : 15;

    const initalTime = new Date();
    const afterTime = new Date(initalTime.getTime() + addTimeInMin * 60 * 1000);    

    await Next_game_start_in.create([{
        startTime : initalTime,
        endTime : afterTime,
        startBy : new ObjectId('68464e01af244e078b00a870'),
        isActive : true
    }],{session});
    //Set Next Game Start In End
}

// AutoSetCardRevealTime();
// AutoCardReveal();
// AutoStartNewGameTime();