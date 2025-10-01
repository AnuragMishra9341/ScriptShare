import app from './app.js'
import { Server } from 'socket.io'
import http from 'http';
import dotenv from "dotenv";
dotenv.config({path : "./.env"});

const server = http.createServer(app);

const io = new Server(server,{
    cors : {
        origin:process.env.FRONTEND_URL,
        credentials:true
    }
})


 io.on('connection',(socket)=>{
       console.log('a user connected');
       

  socket.on("joinRoom", (projectId) => {
    socket.join(projectId);  
    console.log(`Socket ${socket.id} joined project room: ${projectId}`);

    socket.projectId = projectId;
  });
     



   socket.on("message", (msg) => {
    const projectId = socket.projectId;
      socket.to(projectId).emit("message", msg);
    console.log(msg.text);
  });




       socket.on('disconnect', () => {
        console.log('user disconnected');
      
        
 })})

 

const PORT = process.env.PORT;

server.listen((PORT),()=>{
    console.log(`server is running at PORT ${PORT}`);
})