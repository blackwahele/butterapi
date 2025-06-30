import mongoose from "mongoose";
import ApiError from "../../utils/APIError.js";
import ApiResponse from "../../utils/APIResponse.js";
import { STATUS } from "../../constant/GlobalConstant.js";
import User_master from "../../models/admin/user.model.js";
import bcrypt from "bcryptjs";
import Country from "../../models/country.model.js";
import State from "../../models/state.model.js";
import Loose_user_history from "../../models/admin/loose_user_history.model.js";
import Winning_user_history from "../../models/admin/winning_user_history.model.js";
import Admin_account_history from "../../models/admin/admin_account_history.model.js";
import Role_master from "../../models/admin/role_master.model.js";
import Game_mode from "../../models/game_mode.model.js";

const { ObjectId } = mongoose.Types;

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const admin = await User_master.findById(userId)
        const accessToken = admin.generateAccessToken()
        const refreshToken = admin.generateRefreshToken()

        admin.refreshToken = refreshToken
        await admin.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}

    } catch (error) {
        Log.error(`Con::admin(generateAccessAndRefereshTokens) : ${error?.message}`)
        throw new ApiError(500, "Something went wrong while generating referesh and access token",error)
    }
}

export const AdminList = async (req,res) => {
    try {
         const result = await User_master.find().select('-password');
         return res.status(200).json(new ApiResponse(200,"Admin List Request!",result,"Fetch Data Successfully."))
    } catch (error) {
        Log.error(`Con::admin(AdminList) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Admin List Request!",error?.message,error));
        // throw new ApiError(500,"Admin List Request!", error?.message,error);
    }
}

export const ManageAdminData = async (req,res) => {
    try {
         let adminId = req?.body?.adminId;
        // let isExistsObj = !adminId ? {mobile : req?.body?.mobile} : { _id :{ $ne : adminId }, mobile : req?.body?.mobile };        
        // let isExists = await User_master.findOne(isExistsObj)
        // if(isExists){
        //     return res.status(200).json(new ApiError(400,"Manage Admin Request!","Admin Name Already Exists!"));
        // };
       
        let msg = adminId ? "Update Data Successfully." : "Save Data Successfully.";
        let reqObj = { 
            firstName : req.body.firstName, 
            lastName : req.body.lastName, 
            country : req.body.country, 
            state : req.body.state, 
            city : req.body.city, 
            mobCode : req.body.mobCode, 
            roleid : req.body.roleid, 
        };       
        let AdminData = {};

        if(adminId) {
            AdminData = await User_master.findById(adminId);
            AdminData.firstName = req.body.firstName;
            AdminData.lastName = req.body.lastName;
            AdminData.mobCode = req.body.mobCode;
            AdminData.country = req.body.country;
            AdminData.state = req.body.state;
            AdminData.city = req.body.city;
            AdminData.roleid = req.body.roleid;
        }else{
            reqObj = { 
                ...reqObj, 
                userName: req.body.userName,  
                mobile : req.body.mobile, 
                email : req.body.email, 
                password : await bcrypt.hash(req.body.password, 10), 
                status : STATUS?.ACTIVE 
            }
            AdminData = new User_master(reqObj);
        }
        
        await AdminData.save();        
        return res.status(200).json(new ApiResponse(200,"Manage Admin Request!",msg));
    } catch (error) {
        Log.error(`Con::admin(ManageAdminData) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Manage Admin Request!",error?.message,error));
        // throw new ApiError(500,"Manage Role Request!", error?.message,error);
    }
}

export const AdminDetailData = async (req,res) => {
    try {
        let adminId = req?.params?.id;
        let AdminData = await User_master.findById(adminId);
        return res.status(200).json(new ApiResponse(200,"Admin Detail Request!","Fetch Data Successfully.",AdminData));
    } catch (error) {
        Log.error(`Con::admin(AdminDetailData) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Manage Admin Request!",error?.message,error));
        // throw new ApiError(500,"Manage Role Request!", error?.message,error);
    }
}

export const ManageAdminStatusData = async (req,res) => {
    try {
         let adminId = req?.params?.id;
        if(!adminId){
            return res.status(200).json(new ApiError(400,"Manage Admin Status Request!","Please provide adminId."));
        }
        let role = await User_master.findById(adminId);
        if(!role){
            return res.status(200).json(new ApiError(400,"Manage Admin Status Request!","Role not exist."));
        }
        role.status = role.status == STATUS.ACTIVE ? STATUS.SUSPENDED : STATUS.ACTIVE; 
        await role.save()

        return res.status(200).json(new ApiResponse(200,"Manage Admin Status Request!","Change Data Status Successfully."));
    } catch (error) {
        Log.error(`Con::admin(ManageAdminStatusData) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Manage Admin Status Request!",error?.message,error));
        // throw new ApiError(500,"Manage Admin Request!", error?.message,error);
    }
}

export const DeleteAdminData = async (req,res) => {
    try {        
        let adminId = req?.params?.id;
        if(!adminId){
            return res.status(200).json(new ApiError(400,"Delete Admin Request!","Please provide adminId."));
        }
        let deleteRole = await User_master.findByIdAndDelete(adminId);
        if (!deleteRole) {
            return res.status(200).json(new ApiError(404,"Delete Admin Request!","No Role Exist For This adminId."));
        }    
        return res.status(200).json(new ApiResponse(200,"Delete Admin Request!","Delete Data Successfully."));
    } catch (error) {
        Log.error(`Con::admin(DeleteAdminData) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Delete Admin Request!",error?.message,error));
        // throw new ApiError(500,"Delete Admin Request!", error?.message,error);
    }
}

export const AdminLogin = async (req,res) => {
    try {
        const RoleData = await Role_master.find({ rolename : { $in : ['Super Admin' , 'Admin', 'Staff'] }, status : 'Active' });

        const RoleIds = RoleData?.map(O=>O?._id);

        const { email, password } = req.body;

        const adminData = await User_master.findOne({ email: email , roleid : { $in : RoleIds } });

        if(!adminData){
            return res.status(200).json(new ApiError(400,"Admin Login Request!","Invalid User or Password.")); 
        }

        const isValidPass = await adminData.isPasswordCorrect(password);
        if(!isValidPass){
            return res.status(200).json(new ApiError(400,"Admin Login Request!","Invalid User or Password.")); 
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(adminData._id);

        const options = {
            httpOnly: true,
            secure: true
        }
        const loggedInUser = await User_master.findById(adminData._id).select("-password -refreshToken")
        
        return res.status(200)
                  .cookie("accessToken", accessToken, options)
                  .cookie("refreshToken", refreshToken, options)
                  .json(new ApiResponse(200,"Admin Login Request!",{ user : loggedInUser, accessToken, refreshToken },"Login Successfully."));  

    } catch (error) {
        Log.error(`Con::admin(AdminLogin) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Login Request!",error?.message,error));        
    }
}

export const AdminLogout = async (req,res) => {
    try {
        await User_master.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1 // this removes the field from document
                }
            },
            { new: true }
        )
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
                .status(200)
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
                .json(new ApiResponse(200,"Admin Logout Request!", "Admin logged Out Successfully.",{}));
                
    } catch (error) {
        Log.error(`Con::admin(AdminLogout) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Admin Logout Request!",error?.message,error));        
    }
}

export const RegenarateRefreshAccessToken = async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        return res.status(401).json(new ApiError(401,"Regenerate Token Request!","Unauthorized request!"));  
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await Admin.findById(decodedToken?._id)
    
        if (!user) {
            return res.status(401).json(new ApiError(401,"Regenerate Token Request!","Invalid refresh token!"));  
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            return res.status(401).json(new ApiError(401,"Regenerate Token Request!","Refresh token is expired or used!"));  
            throw new ApiError(401, "Refresh token is expired or used")            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        Log.error(`Con::admin(RegenarateRefreshAccessToken) : ${error?.message}`)
        return res.status(401).json(new ApiError(401,"Regenerate Token Request!","Invalid refresh token!"));  
    }

}

export const CountryList = async (req,res) => {
    try {
         const result = await Country.find();
         return res.status(200).json(new ApiResponse(200,"Country List Request!",result,"Fetch Data Successfully."))
    } catch (error) {
        Log.error(`Con::admin(CountryList) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Country List Request!",error?.message,error));
        // throw new ApiError(500,"Country List Request!", error?.message,error);
    }
}

export const StateList = async (req,res) => {
    try {
         let cid = req.params.cid;         
         const result = await State.find({countryid : cid});
         return res.status(200).json(new ApiResponse(200,"State List Request!",result,"Fetch Data Successfully."))
    } catch (error) {
        Log.error(`Con::admin(StateList) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Country List Request!",error?.message,error));
        // throw new ApiError(500,"Country List Request!", error?.message,error);
    }
}


export const GetLooseUserList = async (req,res) => {
    try {
        let LooseUserData = await Loose_user_history.aggregate([
                                {
                                    $group : {
                                        _id : '$userId',
                                        totalLooseAmt : { $sum : '$bet_amt'},
                                        userId: { $first: '$userId' },
                                    }
                                },
                                {
                                    $lookup : {
                                        from: "users",             
                                        localField: "userId",     
                                        foreignField: "_id",       
                                        as: "user"   
                                    }
                                },
                                {
                                    $addFields : {
                                        userDetail : {
                                            $first : "$user"
                                        }
                                    }
                                },
                                {
                                    $project: {                   
                                        userId: 1,
                                        totalLooseAmt: 1,
                                        "userDetail.firstName": 1,
                                        "userDetail.lastName": 1,
                                        "userDetail.email": 1,
                                        "userDetail.userName": 1,
                                        "userDetail.mobile": 1,
                                        "userDetail.status": 1
                                    }
                                }
                            ]);
         
         return res.status(200).json(new ApiResponse(200,"Loose User List Request!",LooseUserData,"Fetch Data Successfully."));        
    } catch (error) {
        Log.error(`Con::admin(GetLooseUserList) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Loose User List Request!",error?.message,error));        
    }
}

export const GetLooseUserCardHistory = async (req, res) => {
      try {
        let userId = ((req?.params?.id) ? req?.params?.id : req?.user?._id);
        
        let LooseUserCardData = await Loose_user_history.aggregate([
                                {
                                    $match : {
                                        userId : new ObjectId(userId)
                                    }
                                },
                                {
                                    $group : {
                                        _id : '$cardId',
                                        totalBetAmt : {
                                            $sum : '$bet_amt'
                                        },
                                        cardId: { $first: '$cardId' },
                                    }
                                },
                                {
                                    $lookup : {
                                        from: "cards",             
                                        localField: "cardId",     
                                        foreignField: "_id",       
                                        as: "card"    
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
                                    $project: {                   
                                        userId: 1,
                                        totalBetAmt: 1,
                                        "card_detail.cardName": 1,
                                        "card_detail.cardImage": 1
                                    }
                                }                            
                            ]);
         return res.status(200).json(new ApiResponse(200,"Loose User Card List Request!",LooseUserCardData,"Fetch Data Successfully."));        
    } catch (error) {
         Log.error(`Con::admin(GetLooseUserCardHistory) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Loose User Card List Request!",error?.message,error));        
    }
}

export const GetWinUserList = async (req,res) => {
    try {
        let WinUserData = await Winning_user_history.aggregate([
                                {
                                    $group : {
                                        _id : '$userId',
                                        totalWinAmt : { $sum : '$total_bet_amt'},
                                        userId: { $first: '$userId' }
                                    }
                                },
                                {
                                    $lookup : {
                                        from: "users",             
                                        localField: "userId",     
                                        foreignField: "_id",       
                                        as: "user"   
                                    }
                                },
                                {
                                    $addFields : {
                                        userDetail : {
                                            $first : "$user"
                                        }
                                    }
                                },
                                {
                                    $project: {                   
                                        userId: 1,
                                        totalWinAmt: 1,
                                        "userDetail.firstName": 1,
                                        "userDetail.lastName": 1,
                                        "userDetail.email": 1,
                                        "userDetail.userName": 1,
                                        "userDetail.mobile": 1,
                                        "userDetail.status": 1
                                    }
                                }
                            ]);
         
         return res.status(200).json(new ApiResponse(200,"Win User List Request!",WinUserData,"Fetch Data Successfully."));        
    } catch (error) {
        Log.error(`Con::admin(GetWinUserList) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Win User List Request!",error?.message,error));        
    }
}

export const GetWinUserCardHistory = async (req, res) => {
      try {
        let userId = ((req?.params?.id) ? req?.params?.id : req?.user?._id);
        
        let winUserCardData = await Winning_user_history.aggregate([
                                {
                                    $match : {
                                        userId : new ObjectId(userId)
                                    }
                                },
                                {
                                    $group : {
                                        _id : '$cardId',
                                        totalBetAmt : {
                                            $sum : '$bet_amt'
                                        },
                                        cardId: { $first: '$cardId' },
                                    }
                                },
                                {
                                    $lookup : {
                                        from: "cards",             
                                        localField: "cardId",     
                                        foreignField: "_id",       
                                        as: "card"    
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
                                    $project: {                   
                                        userId: 1,
                                        totalBetAmt: 1,
                                        "card_detail.cardName": 1,
                                        "card_detail.cardImage": 1
                                    }
                                }                            
                            ]);
         return res.status(200).json(new ApiResponse(200,"Win User Card List Request!",winUserCardData,"Fetch Data Successfully."));        
    } catch (error) {
         Log.error(`Con::admin(GetWinUserCardHistory) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Win User Card List Request!",error?.message,error));        
    }
}

export const GetAdminAccHistroyList = async (req, res) => {
      try {        
        let adminAccountHistoryData = await Admin_account_history.find().sort({ created_at : -1 }).select('sess_name win_amt mutiplyBy total_loose_amt total_users');
         return res.status(200).json(new ApiResponse(200,"Admin Account History List Request!",adminAccountHistoryData,"Fetch Data Successfully."));        
    } catch (error) {
        Log.error(`Con::admin(GetAdminAccHistroyList) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Admin Account History List Request!",error?.message,error));        
    }
}

export const ManageGameModeData = async (req,res) => {
    try {
          const GameModeData = await Game_mode.findOne();
          const gameMode = req?.body?.gameMode == "on" ? true : false; 
          if(GameModeData){
            GameModeData.gameMode = gameMode;
            await GameModeData.save();
          }else{ 
            await Game_mode.create({gameMode : gameMode});
          }
         return res.status(200).json(new ApiResponse(200,"Game Mode Change Request!",[],"Change Game Mode Successfully."));     
    } catch (error) {
        Log.error(`Con::admin(ManageGameModeData) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Game Mode Change Request!",error?.message,error));                
    }
}

export const GetGameModeDetail = async (req, res) => {
    try {
         const GameModeData = await Game_mode.findOne();
         return res.status(200).json(new ApiResponse(200,"Game Mode Detail Request!",GameModeData,"Fetch Detail Successfully."));             
    } catch (error) {
        Log.error(`Con::admin(GetGameModeDetail) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Game Mode Detail Request!",error?.message,error));                        
    }
}
