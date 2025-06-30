import express from "express";
import { RegisterUser, UserLogin, UserLogout, UserDetailData, UpdateUserDetailData,
         ChangeUserPassword, GetUserWalletHistory, GetGameSessionHistory, GetGameSessionHistoryDetail, ForgotPassword, VerifyOTP, VerifyToken, ResetUserPassword } from "../../controllers/user/user.controller.js";
import { verifyJWTToken } from "../../middlewares/authenticate.middleware.js";
import { ManageUserMiddleware } from "../../middlewares/user.middleware..js";
import { ManageUserUpdateMiddleware, ManageChangePasswordMiddleware } from "../../middlewares/update_user.middleware.js";
import { GetWinUserCardHistory, GetLooseUserCardHistory } from "../../controllers/admin/admin.controller.js";

const Router = express.Router();

Router.post('/registration',[ManageUserMiddleware],RegisterUser);
Router.post('/login', UserLogin);
Router.post('/logout',[verifyJWTToken], UserLogout);
Router.get('/profileDetail', [verifyJWTToken], UserDetailData);
Router.post('/updateProfile', [verifyJWTToken, ManageUserUpdateMiddleware], UpdateUserDetailData);
Router.post('/changePassword', [verifyJWTToken, ManageChangePasswordMiddleware], ChangeUserPassword);
Router.get('/win_user_card/list', [ verifyJWTToken ], GetWinUserCardHistory);
Router.get('/loose_user_card/list', [ verifyJWTToken ], GetLooseUserCardHistory);
Router.get('/wallet_history/list', [ verifyJWTToken ], GetUserWalletHistory);
Router.get('/game_history/session_list', [ verifyJWTToken ], GetGameSessionHistory);
Router.post('/game_history/session_detail', [ verifyJWTToken ], GetGameSessionHistoryDetail);
Router.post('/forgot_password' , ForgotPassword);
Router.post('/verify_otp' , VerifyOTP);
Router.get('/verify_token/:token' , VerifyToken);
Router.post('/reset_user_password' , ResetUserPassword);

export default Router;