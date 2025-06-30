import express from "express";
import { CountryList, StateList } from "../controllers/admin/admin.controller.js";

const Router = express.Router();

Router.get('/country_list', CountryList);
Router.get('/state_list/:cid', StateList);

export default Router;