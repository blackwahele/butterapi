import express from "express";
import { RoleList, ManageRoleData, ManageRoleStatusData, DeleteRoleData } from "../controllers/role.controller.js";
import { ManageRoleMiddleware } from "../middlewares/role.middleware.js";

const Router = express.Router();
Router.get('/list',RoleList);
Router.post('/manage-data',[ManageRoleMiddleware],ManageRoleData);
Router.delete('/delete-data/:id',DeleteRoleData);
Router.put('/manage-status/:id',ManageRoleStatusData);

export default Router;