import express from "express";
import { CardList } from "../../controllers/user/card.controller.js";
import { verifyJWTToken } from "../../middlewares/authenticate.middleware.js";

const Router = express.Router();

Router.get('/list',[verifyJWTToken],CardList);

export default Router;