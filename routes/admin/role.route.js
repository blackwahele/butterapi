import express from "express";
import { RoleList, ManageRoleData,RoleDetailData, ManageRoleStatusData, DeleteRoleData } from "../../controllers/admin/role.controller.js";
import { ManageRoleMiddleware } from "../../middlewares/role.middleware.js";
import { verifyJWTToken } from "../../middlewares/authenticate.middleware.js";

const Router = express.Router();
Router.get('/list', [ verifyJWTToken ], RoleList);
Router.get('/detail/:id', [ verifyJWTToken ], RoleDetailData);
Router.post('/manage-data', [ verifyJWTToken, ManageRoleMiddleware], ManageRoleData);
Router.delete('/delete_data/:id', [verifyJWTToken], DeleteRoleData);
Router.put('/manage_status/:id', [ verifyJWTToken ], ManageRoleStatusData);

export default Router;