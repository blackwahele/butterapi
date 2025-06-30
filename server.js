import app from './app.js'
import { ConnectDB } from './database/connectionDB.js';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { SetCardRevealTimeCronJob, SetWinningCardCronJob, StartNewGameJob } from './utils/helper.js';

dotenv.config();

const PORT = process.env.PORT;

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.user = decoded; // attach user info to socket
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

global._io = io;

io.on('connection', (socket) => {
  console.log("User connected:", socket.id);
});

(async ()=>{
      ConnectDB();
    //Run CronJob Every Second Start
      // StartNewGameJob();
      // SetCardRevealTimeCronJob();
      // SetWinningCardCronJob();
    //Run CronJob Every Second End

    server.listen(PORT,()=>{
        console.log(`Express App Is Running On port http://localhost:${PORT}`);
    })
})()


// (async ()=>{
//     ConnectDB();
//     app.listen(PORT,()=>{
//         console.log(`Express App Is Running On port http://localhost:${PORT}`);
//     })
// })()