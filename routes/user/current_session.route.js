import express from "express";
import { GetCurrentSessionTime, SetUserBetData, GetTotalBetAmt, GetCardDetailList, GetCardRevealTime, GetNextGameStartIn } from "../../controllers/user/current_session.controller.js";
import { verifyJWTToken } from "../../middlewares/authenticate.middleware.js";

const Router = express.Router();
Router.get('/get_time', [ verifyJWTToken ], GetCurrentSessionTime);
Router.get('/get_card_time', [ verifyJWTToken ], GetCardRevealTime);
Router.get('/get_next_game_start_in', [ verifyJWTToken ], GetNextGameStartIn);
Router.post('/set_bet_data', [ verifyJWTToken ], SetUserBetData);
Router.post('/get_total_bet_amt', [ verifyJWTToken ], GetTotalBetAmt);
Router.post('/get_card_detail_list', [ verifyJWTToken ], GetCardDetailList);


export default Router;