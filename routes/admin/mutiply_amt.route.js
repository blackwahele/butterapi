import express from "express";
import { MultiplyAmtList, ManageMultiplyAmtData,MultiplyAmtDetailData, ManageMultiplyAmtStatusData, DeleteMultiplyAmtData } from "../../controllers/admin/multiply_amt.controller.js";
import { ManageMultiplyAmtMiddleware } from "../../middlewares/multiplyAmt.middleware.js";
import { verifyJWTToken } from "../../middlewares/authenticate.middleware.js";

const Router = express.Router();
Router.get('/list', [ verifyJWTToken ], MultiplyAmtList);
Router.get('/detail/:id', [ verifyJWTToken ], MultiplyAmtDetailData);
Router.post('/manage-data', [ verifyJWTToken, ManageMultiplyAmtMiddleware], ManageMultiplyAmtData);
Router.delete('/delete_data/:id', [verifyJWTToken], DeleteMultiplyAmtData);
Router.put('/manage_status/:id', [ verifyJWTToken ], ManageMultiplyAmtStatusData);

export default Router;