import ApiError from "../../utils/APIError.js";
import ApiResponse from "../../utils/APIResponse.js";
import User_master from "../../models/admin/user.model.js";
import bcrypt from "bcryptjs";
import Role_master from "../../models/admin/role_master.model.js";
import User_wallet_history from "../../models/user/user_wallet_history.model.js";
import Old_session from "../../models/old_session.model.js";
import Old_bet_by_user from "../../models/user/old_bet_user.model.js";
import Old_current_bet_on_card from "../../models/user/old_bet_card.model.js";
import Password_reset_otp from "../../models/password_reset_otps .model.js";
import SendSMS from "../../utils/SMS.sender.js";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
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
         Log.error(`Con::user(generateAccessAndRefreshTokens) : ${error?.message}`)
        throw new ApiError(500, "Something went wrong while generating referesh and access token",error)
    }
}

export const RegisterUser = async (req,res) => {
    try {  
        let RoleData = await Role_master.findOne({ rolename : 'Customer'});

        let mobileData = req.body.mobile.split(' ');
        let reqObj = { 
            firstName : req.body.firstName || '', 
            lastName : req.body.lastName || '', 
            userName : req.body.userName || '', 
            email : req.body.email || '', 
            country : req.body.country || '', 
            state : req.body.state || '', 
            city : req.body.city || '', 
            password : bcrypt.hashSync(req.body.password,10), 
            mobCode : mobileData?.[0] || '', 
            mobile : mobileData?.[1] || '',
            roleid : RoleData?._id || ''
        };   
        let UserData = new User_master(reqObj);
        
        await UserData.save();        
        return res.status(200).json(new ApiResponse(200,"Register User Request!",[],'You are Register Successfully.'));
    } catch (error) {
        Log.error(`Con::user(RegisterUser) : ${error?.message}`);
        return res.status(200).json(new ApiError(500,"Register User Request!",error?.message,error));
        // throw new ApiError(500,"Manage Role Request!", error?.message,error);
    }
}

export const UserDetailData = async (req,res) => {
    try {
        let userId = req?.user?._id;
        let userData = await User_master.findById(userId).select('-password -roleid');
        return res.status(200).json(new ApiResponse(200,"User Detail Request!",userData,"Fetch Data Successfully."));
    } catch (error) {
        Log.error(`Con::user(UserDetailData) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"User Detail Request!",error?.message,error));
        // throw new ApiError(500,"Manage Role Request!", error?.message,error);
    }
}

export const UpdateUserDetailData = async (req,res) => {
    try {
        let userId = req?.user?._id;
        let userData = await User_master.findById(userId);
            userData.firstName = req.body.firstName;
            userData.lastName = req.body.lastName;
            userData.email = req.body.email;
            userData.country = req.body.country;
            userData.state = req.body.state;
            userData.city = req.body.city;
        if(userData.save()){
            return res.status(200).json(new ApiResponse(200,"User Detail Update Request!",[],"Update Data Successfully."));
        }else{
             Log.error(`Con::user(UpdateUserDetailData) : Failed to Update Data.`)
            return res.status(200).json(new ApiError(200,"User Detail Update Request!","Failed to Update Data."));
        }
    } catch (error) {
         Log.error(`Con::user(UpdateUserDetailData) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"User Detail Update Request!",error?.message,error));
        // throw new ApiError(500,"Manage Role Request!", error?.message,error);
    }
}

export const ChangeUserPassword = async (req,res) => {
    try {
        let userId = req?.user?._id;
        const { old_pass, new_pass, confirm_pass } = req.body;

        let userData = await User_master.findById(userId);

        if(!userData){
            return res.status(200).json(new ApiError(200,"Change Password Request!","Invalid User.")); 
        }

        if(old_pass == new_pass){
            return res.status(200).json(new ApiError(200,"Change Password Request!","Old Password and New Password are not same.")); 
        }

        const isValidPass = await userData.isPasswordCorrect(old_pass);
        
        if(!isValidPass){
            return res.status(200).json(new ApiError(200,"Change Password Request!","Old Password is Incorrect.")); 
        }

        userData.password = bcrypt.hashSync(req.body.new_pass,10);  

        if(userData.save()){
            return res.status(200).json(new ApiResponse(200,"Change Password Request!",[],"Update Data Successfully."));
        }else{
            return res.status(200).json(new ApiError(200,"Change Password Request!","Failed to Update Data."));
        }
    } catch (error) {
         Log.error(`Con::user(ChangeUserPassword) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Change Password Request!",error?.message,error));
        // throw new ApiError(500,"Manage Role Request!", error?.message,error);
    }
}

export const UserLogin = async (req,res) => {
    try {

        const RoleData = await Role_master.findOne({ rolename : 'Customer', status : 'Active' });
        
        const RoleId = RoleData?._id;

        const { userID, password } = req.body;

        const query = [];

        if (!isNaN(userID)) {
           query.push({ mobile: Number(userID) });
        }

        query.push({ userName: userID });

        const userData = await User_master.findOne({$or : query, roleid : RoleId });
        
        if(!userData){
            return res.status(200).json(new ApiError(200,"User Login Request!","Invalid User or Password.")); 
        }

        const isValidPass = await userData.isPasswordCorrect(password);
        if(!isValidPass){
            return res.status(200).json(new ApiError(200,"User Login Request!","Invalid User or Password.")); 
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(userData._id);

        const options = {
            httpOnly: true,
            secure: true
        }
        const loggedInUser = await User_master.findById(userData._id).select("userName firstName lastName");

        Log.info(`${userData?.userName} Successfully Login.`);

        return res.status(200)
                  .cookie("accessToken", accessToken, options)
                  .cookie("refreshToken", refreshToken, options)
                  .json(new ApiResponse(200,"User Login Request!",{ user : loggedInUser, accessToken, refreshToken },"Login Successfully."));  

    } catch (error) {
        Log.error(`Con::user(UserLogin) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Login Request!",error?.message,error));        
    }
}

export const UserLogout = async (req,res) => {
    try {
        Log.info(`${req?.user?.userName} Successfully Logout.`);
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
                .json(new ApiResponse(200,"User Logout Request!", "User logged Out Successfully.",{}));
                
    } catch (error) {
         Log.error(`Con::user(UserLogout) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"User Logout Request!",error?.message,error));        
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
         Log.error(`Con::user(RegenerateRefreshAccessToken) : ${error?.message}`)
        return res.status(401).json(new ApiError(401,"Regenerate Token Request!","Invalid refresh token!"));  
    }

}

export const GetUserWalletHistory = async (req,res) => {
    try {
        let userId = req?.user?._id;
        const result = await User_wallet_history.find({ user_id : userId });
        return res.status(200).json(new ApiResponse(200,"User Wallet List Request!",result,"Fetch Data Successfully."));
    } catch (error) {
         Log.error(`Con::user(GetUserWalletHistory) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"User Wallet List Request!",error?.message,error));                  
    }
}

export const GetGameSessionHistory = async (req, res) => {
    try { 
          const endDate = new Date();
          const startDate = new Date();
                startDate.setDate(startDate.getDate() - 5);
          const result = await Old_session.find({created_at: {
                                $gte: startDate,
                                $lte: endDate
                            }}).select('current_session_name old_id created_at').sort({created_at : -1});
        return res.status(200).json(new ApiResponse(200,"Game Session History List Request!",result,"Fetch Data Successfully."));        
    } catch (error) {
         Log.error(`Con::user(GetGameSessionHistory) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Game Session History List Request!",error?.message,error));                          
    }
}

export const GetGameSessionHistoryDetail = async (req, res) => {
    try { 
         const sessId = req.body.sess_id;
         const userSessData = await Old_bet_by_user.findOne({current_session_id : new ObjectId(sessId) }).select('old_id');
         const userSessId = userSessData?.old_id;
         console.log('userSessId',userSessId)
         const cardData = await Old_current_bet_on_card.aggregate([
                                {
                                    $match : {
                                        sess_user_id : userSessId
                                    }
                                },
                                {
                                    $lookup : {
                                        from : 'cards',
                                        localField : 'card_id',
                                        foreignField : '_id',
                                        as : 'card'
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
                                    $lookup : {
                                        from : 'old_bet_by_users',
                                        localField : 'sess_user_id',
                                        foreignField : 'old_id',
                                        as : 'user'
                                    }
                                },
                                {
                                    $addFields : {
                                        user_sess_data : {
                                            $first : "$user"
                                        }
                                    }
                                },
                                {
                                    $lookup: {
                                        from: "winning_cards",
                                        let: { sessionId: "$user_sess_data.current_session_id" },
                                        pipeline: [
                                        {
                                            $match: {
                                            $expr: {
                                                $eq: ["$_id", "$$sessionId"]
                                            }
                                            }
                                        }
                                        ],
                                        as: "winning_card_info"
                                    }
                                },
                                {
                                    $addFields: {
                                        winning_card_data: { $first: "$winning_card_info" }
                                    }
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        bet_amt : 1,
                                        mutiplyBy : 1,
                                        'card_detail.cardName': 1,
                                        'card_detail.cardImage': 1,
                                        'card_detail.cardImage': 1,
                                        'winning_card_data.card_id': 1,
                                    }
                                }
                            ]);   
                            console.log("cardData",cardData)                         
        return res.status(200).json(new ApiResponse(200,"Game Session History List Request!",cardData,"Fetch Data Successfully."));        
    } catch (error) {
         Log.error(`Con::user(GetGameSessionHistoryDetail) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Game Session History List Request!",error?.message,error));                          
    }
}

export const ForgotPassword = async (req, res) => {
    try {
        const mobileNo = req?.body?.mobileNo;
        if(!mobileNo){
          return res.status(200).json(new ApiError(200,"ForgotPassword Request!","Please Enter Your Register Mobile No.")); 
        }

        const UserData = await User_master.findOne({mobile :mobileNo });

        if(!UserData){
          return res.status(200).json(new ApiError(200,"ForgotPassword Request!","No account found with this number.")); 
        }

        // Always respond the same to avoid user enumeration
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

        const accessToken = jwt.sign( { _id: UserData?._id, userName : UserData?.userName }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' });
        let otpObj = {
            user_id : UserData?._id,
            otp_hash : bcrypt.hashSync(otp,10),
            expires_at : expiresAt,
            token : accessToken,
            used : false
        }
        await Password_reset_otp.deleteMany({user_id : UserData?._id});

        let setOtp = await Password_reset_otp.create(otpObj);
        console.log('otp',otp)
        // await SendSMS(mobileNo,otp);
        return res.status(200).json(new ApiResponse(200,"ForgotPassword Request!",{otp,token : accessToken},"Send OTP on your Register Mobile No Successfully."));                
    } catch (error) {
         Log.error(`Con::user(ForgotPassword) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"ForgotPassword Request!",error?.message,error));   
    }
}

export const VerifyOTP = async (req, res) => {
    try {
        const OTP = req?.body?.otp;
        const token = req?.body?.token;
        const otpRecord = await Password_reset_otp.findOne({            
                                token: token,
                                used: false,
                                expires_at: { $gt: new Date() }
                          }).sort({ createdAt: -1 });
        
        if(!otpRecord){
            return res.status(200).json(new ApiError(200,"Verify OTP Request!",'Please Enter Correct OTP Or Try Again.')); 
        }
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if(!decodeToken){
            return res.status(200).json(new ApiError(200,"Verify OTP Request!",'Please Enter Correct OTP Or Try Again.')); 
        }
        await otpRecord.deleteOne();
        const accessToken = jwt.sign( { _id: decodeToken?._id, userName : decodeToken?.userName }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' });
        return res.status(200).json(new ApiResponse(200,"Verify OTP Request!",{token : accessToken },"Verify Your OTP Successfully."));   
    } catch (error) {
         Log.error(`Con::user(VerifyOTP) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Verify OTP Request!",error?.message,error));  
    }
}

export const VerifyToken = async (req, res) => {
    try {       
        const token = req?.params?.token;  
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if(!decodeToken){
            return res.status(200).json(new ApiError(200,"Verify Token Request!",'Please Enter Correct OTP Or Try Again.')); 
        }
        return res.status(200).json(new ApiResponse(200,"Verify Token Request!",{ userName : decodeToken?.userName },"Verify Your OTP Successfully."));   
    } catch (error) {
         Log.error(`Con::user(VerifyToken) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Verify Token Request!",error?.message,error));  
    }
}

export const ResetUserPassword = async (req, res) => {
    try {
        const OTP = req?.body?.otp;
        const token = req?.body?.token;
        const new_password = req?.body?.new_password;
        const confirm_password = req?.body?.confirm_password;

        if(new_password != confirm_password){
            return res.status(200).json(new ApiError(200,"Reset Password Request!",'Password Did Not Match.')); 
        } 

        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if(!decodeToken){
            return res.status(200).json(new ApiError(200,"Reset Password Request!",'Your Token is Expired!')); 
        }
        const userData = await User_master.findById(decodeToken?._id);
              userData.password = bcrypt.hashSync(new_password,10);        
        if(await userData.save()){
            return res.status(200).json(new ApiResponse(200,"Reset Password Request!",[],"Passwrod Reset Successfully."));               
        }else{
            return res.status(200).json(new ApiResponse(200,"Reset Password Request!",[],"Something Went Wrong."));   
        }         
    } catch (error) {
         Log.error(`Con::user(ResetUserPassword) : ${error?.message}`)
        return res.status(500).json(new ApiError(500,"Reset Password Request!",error?.message,error));  
    }
}

