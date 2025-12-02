import express from 'express';
import dotenv from 'dotenv';
import {createServer} from 'http'
import { connectDB } from './config/connectDatabase';
import session from 'express-session';
import cors from 'cors'
import { corsOption } from './config/corsConfig';
import path from 'path';
import { sessionOptions } from './config/session.config';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes'
import vendorRoutes from './routes/vendorRoutes'
import adminRoutes from './routes/adminRoutes'


dotenv.config()

export const app = express();
const server = createServer(app);






app.use(cors(corsOption));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../../Frontend/dist')));
app.use(session(sessionOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



app.use('/api/user', userRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);


const PORT = process.env.PORT || 3000;
connectDB()
.then(() => {
    server.listen(PORT,() => {
        console.log(`Server is running on port ${PORT}`);
        
    })
})
.catch((err) => {
    console.error('Database connection failed',err);
    process.exit(1)
})