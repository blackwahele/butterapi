import express from "express";
import { ManageNextGameTimeMiddleware } from "../../middlewares/nextGameTime.middleware.js";
import { verifyJWTToken } from "../../middlewares/authenticate.middleware.js";
import { NextGameTimeList, NextGameTimeDetailData, ManageNextGameTimeData, ManageNextGameTimeStatusData, DeleteNextGameTimeData } from "../../controllers/admin/next_time.controller.js";

const Router = express.Router();
Router.get('/list', [ verifyJWTToken ], NextGameTimeList);
Router.get('/detail/:id', [ verifyJWTToken ], NextGameTimeDetailData);
Router.post('/manage-data', [ verifyJWTToken, ManageNextGameTimeMiddleware], ManageNextGameTimeData);
Router.delete('/delete_data/:id', [verifyJWTToken], DeleteNextGameTimeData);
Router.put('/manage_status/:id', [ verifyJWTToken ], ManageNextGameTimeStatusData);

export default Router;