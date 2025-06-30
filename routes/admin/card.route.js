import express from "express";
import { CardList, ManageCardData,CardDetailData, ManageCardStatusData, DeleteCardData } from "../../controllers/admin/card.controller.js";
import { ManageCardMiddleware } from "../../middlewares/card.middleware.js";
import { verifyJWTToken } from "../../middlewares/authenticate.middleware.js";

const Router = express.Router();
Router.get('/list', [ verifyJWTToken ], CardList);
Router.get('/detail/:id', [ verifyJWTToken ], CardDetailData);
Router.post('/manage-data', [ verifyJWTToken, ManageCardMiddleware], ManageCardData);
Router.delete('/delete_data/:id', [verifyJWTToken], DeleteCardData);
Router.put('/manage_status/:id', [ verifyJWTToken ], ManageCardStatusData);

export default Router;