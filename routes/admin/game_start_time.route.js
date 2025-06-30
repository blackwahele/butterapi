import express from "express";
import { ManageNextGameTimeMiddleware } from "../../middlewares/nextGameTime.middleware.js";
import { verifyJWTToken } from "../../middlewares/authenticate.middleware.js";
import { GameStartTimeList, GameStartTimeDetailData, ManageGameStartTimeData, ManageGameStartTimeStatusData, DeleteGameStartTimeData } from "../../controllers/admin/game_start_time.controller.js";

const Router = express.Router();
Router.get('/list', [ verifyJWTToken ], GameStartTimeList);
Router.get('/detail/:id', [ verifyJWTToken ], GameStartTimeDetailData);
Router.post('/manage-data', [ verifyJWTToken, ManageNextGameTimeMiddleware], ManageGameStartTimeData);
Router.delete('/delete_data/:id', [verifyJWTToken], DeleteGameStartTimeData);
Router.put('/manage_status/:id', [ verifyJWTToken ], ManageGameStartTimeStatusData);

export default Router;