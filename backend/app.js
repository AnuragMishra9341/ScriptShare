import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connect from './db/db.js';

const app = express();



connect();

 app.use(express.json({limit:'16kb'}));
  app.use(express.static('public'));
app.use(cors({
    origin : '*',
    credentials:true
}));
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));


export default app;