import express from "express";
import { AdminLogin, AdminLogout, RegenarateRefreshAccessToken, CountryList, StateList } from "../../controllers/admin/admin.controller.js";
import { LoginMiddleware } from "../../middlewares/login.middleware.js";
import { verifyJWTToken } from "../../middlewares/authenticate.middleware.js";

const Router = express.Router();
Router.post('/login',[LoginMiddleware],AdminLogin);
Router.post('/logout',[verifyJWTToken],AdminLogout);
Router.post('/regenerate_token', RegenarateRefreshAccessToken);

Router.get('/country_list', CountryList);
Router.get('/state_list/:cid', StateList);


export default Router;