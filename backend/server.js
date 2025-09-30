import app from './app.js'
import { Server } from 'socket.io'
import http from 'http';
import dotenv from "dotenv";
dotenv.config({path : "./.env"});

const server = http.createServer(app);

const io = new Server(server,{
    cors : {
        origin:'*',
        credentials:true
    }
})


 io.on('connection',(socket)=>{
       console.log('a user connected');

       socket.on('disconnect', () => {
        console.log('user disconnected');

    });
 })

const PORT = process.env.PORT;

server.listen((PORT),()=>{
    console.log(`server is running at PORT ${PORT}`);
})