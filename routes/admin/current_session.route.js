import express from "express";
import { CurrentSessionList, StartCurrentSessionTime, StopCurrentSessionTime, 
        DeleteCurrentSessionTime, GetCurrentCardList, RevealCard, RevealCardAuto,
        PredicCardCalculation 
} from "../../controllers/admin/current_session.controller.js";
import { verifyJWTToken } from "../../middlewares/authenticate.middleware.js";

const Router = express.Router();
Router.get('/list', [ verifyJWTToken ], CurrentSessionList);
Router.post('/start_timer', [ verifyJWTToken ], StartCurrentSessionTime);
Router.get('/stop_timer/:session_id', [ verifyJWTToken ], StopCurrentSessionTime);
Router.delete('/delete_timer/:id', [verifyJWTToken], DeleteCurrentSessionTime);
Router.get('/get_current_card_list', [verifyJWTToken], GetCurrentCardList);
Router.post('/reveal_card', [verifyJWTToken], RevealCard);
Router.get('/reveal_card_auto', [verifyJWTToken], RevealCardAuto);
Router.post('/card_detail', [verifyJWTToken], PredicCardCalculation);

export default Router;