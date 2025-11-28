import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connect from './db/db.js';
import userRouter from './routes/user.routes.js';
import morgan from 'morgan';
import projectRouter from './routes/projects.routes.js'
const app = express();



connect();

 app.use(express.json({limit:'16kb'}));
  app.use(express.static('public'));
  
app.use(cors({
    origin : process.env.FRONTEND_URL,
    credentials:true
}));
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
// app.use(morgan('dev'));


// --------------------------- routes ---------------------------


app.use('/users',userRouter);
app.use('/projects',projectRouter);

export default app;