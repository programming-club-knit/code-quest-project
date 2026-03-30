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
import systemRoutes from './modules/system/system.routes.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: true, // true mirrors the requesting origin, allowing ANY origin
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
app.use('/api/system', systemRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server is running on : ", PORT);
});

export default app;