import express from 'express'
import UploadFileAndImages from './utils/upload.js';
import cookieParser from "cookie-parser"
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

import RoleRoutes from './routes/admin/role.route.js';
import CardRoutes from './routes/admin/card.route.js';
import AdminRoutes from './routes/admin/admin.route.js';
import MutiplyAmtRoutes from './routes/admin/mutiply_amt.route.js';
import AdminLoginRoutes from './routes/admin/login.route.js';
import AdminCurrentSessionRoutes from './routes/admin/current_session.route.js';
import AdminNextGameTimeRoutes from './routes/admin/next_game_time.route.js';
import AdminCardRevealTimeRoutes from './routes/admin/card_reveal_time.route.js';
import AdminGameStartTimeRoutes from './routes/admin/game_start_time.route.js';

import UserCurrentSessionRoutes from './routes/user/current_session.route.js';
import UserRoutes from './routes/user/user.route.js';
import CardUserRoutes from './routes/user/card.route.js';
import Log from './utils/logger.js';

//to Access Log Without Import
global.Log = Log;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors())
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(UploadFileAndImages);
app.use(cookieParser())

//Admin Routes
app.use('/api/admin/',AdminLoginRoutes);
app.use('/api/admin/role',RoleRoutes);                                       //for CRUD of role_masters table
app.use('/api/admin/staff',AdminRoutes);
app.use('/api/admin/card',CardRoutes);                                       //for CRUD of cards table
app.use('/api/admin/multiply_amt',MutiplyAmtRoutes);                         //for CRUD of multiply_amt table
app.use('/api/admin/game_start_time',AdminGameStartTimeRoutes);
app.use('/api/admin/next_game_time',AdminNextGameTimeRoutes);               //for CRUD of next_game_time table
app.use('/api/admin/card_reveal_time',AdminCardRevealTimeRoutes);            //for CRUD of card_reaveal_times table
app.use('/api/admin/current_session',AdminCurrentSessionRoutes);


//User Routes
app.use('/api/user',UserRoutes);
app.use('/api/user/card',CardUserRoutes);
app.use('/api/user/current_session',UserCurrentSessionRoutes);

export default app;