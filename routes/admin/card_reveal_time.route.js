import express from "express";
import { ManageCardRevealTimeMiddleware } from "../../middlewares/cardRevealTime.middleware.js";
import { verifyJWTToken } from "../../middlewares/authenticate.middleware.js";
import { CardRevealTimeList, CardRevealTimeDetailData, ManageCardRevealTimeData, ManageCardRevealTimeStatusData, DeleteCardRevealTimeData } from "../../controllers/admin/card_reveal_time.controller.js";

const Router = express.Router();
Router.get('/list', [ verifyJWTToken ], CardRevealTimeList);
Router.get('/detail/:id', [ verifyJWTToken ], CardRevealTimeDetailData);
Router.post('/manage-data', [ verifyJWTToken, ManageCardRevealTimeMiddleware], ManageCardRevealTimeData);
Router.delete('/delete_data/:id', [verifyJWTToken], DeleteCardRevealTimeData);
Router.put('/manage_status/:id', [ verifyJWTToken ], ManageCardRevealTimeStatusData);

export default Router;