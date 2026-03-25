import dotenv from 'dotenv';
dotenv.config();
import express from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import authRoutes from './modules/auth/auth.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import riddlesRoutes from './modules/riddles/riddles.routes.js';
import problemsRoutes from './modules/problems/problems.routes.js';
import submissionsRoutes from './modules/submissions/submissions.routes.js';
import leaderboardRoutes from './modules/leaderboard/leaderboard.routes.js';

import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true
    }
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // Your Vite React frontend URL
    credentials: true // Allow cookies to be sent with requests
}));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/riddles', riddlesRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log("Server is running on : ", PORT);
});

export default app;