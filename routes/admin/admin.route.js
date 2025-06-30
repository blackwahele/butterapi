import express from "express";
import { AdminList, ManageAdminData,AdminDetailData, ManageAdminStatusData, DeleteAdminData,
        CountryList, StateList, GetLooseUserList, GetLooseUserCardHistory, GetWinUserList, GetWinUserCardHistory, GetAdminAccHistroyList,
        ManageGameModeData, GetGameModeDetail
 } from "../../controllers/admin/admin.controller.js";
import { ManageAdminMiddleware } from "../../middlewares/admin.middleware.js";
import { verifyJWTToken } from "../../middlewares/authenticate.middleware.js";

const Router = express.Router();
Router.get('/list', [ verifyJWTToken ], AdminList);
Router.get('/detail/:id', [ verifyJWTToken ], AdminDetailData);
Router.post('/manage-data', [ verifyJWTToken, ManageAdminMiddleware], ManageAdminData);
Router.delete('/delete_data/:id', [verifyJWTToken], DeleteAdminData);
Router.put('/manage_status/:id', [ verifyJWTToken ], ManageAdminStatusData);
Router.get('/country_list', [ verifyJWTToken ], CountryList);
Router.get('/state_list/:cid', [ verifyJWTToken ], StateList);
Router.get('/loose_user/list', [ verifyJWTToken ], GetLooseUserList);
Router.get('/loose_user_card/list/:id', [ verifyJWTToken ], GetLooseUserCardHistory);
Router.get('/win_user/list', [ verifyJWTToken ], GetWinUserList);
Router.get('/win_user_card/list/:id', [ verifyJWTToken ], GetWinUserCardHistory);
Router.get('/admin_acc_history/list', [ verifyJWTToken ], GetAdminAccHistroyList);
Router.post('/game_mode/manage', [ verifyJWTToken ], ManageGameModeData);
Router.get('/game_mode/detail', [ verifyJWTToken ], GetGameModeDetail);


export default Router;