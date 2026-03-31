import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Team from '../../models/Team.js';

export const registerTeam = async (req, res) => {
    try {
        const {
            teamName,
            teamLeaderName,
            teamLeaderEmail,
            password,
            branch,
            year,
            rollNo,
            mobileNo,
            teamMembers
        } = req.body;

        const existingTeam = await Team.findOne({ teamLeaderEmail });
        if (existingTeam) {
            return res.status(400).json({ error: 'Team with this leader email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newTeam = new Team({
            teamName,
            teamLeaderName,
            teamLeaderEmail,
            password: hashedPassword,
            branch,
            year,
            rollNo,
            mobileNo,
            teamMembers
        });

        await newTeam.save();

        res.status(201).json({ message: 'Team registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const loginTeam = async (req, res) => {
    try {
        const { teamLeaderEmail, password } = req.body;

        const team = await Team.findOne({ teamLeaderEmail });
        if (!team || team.isDeleted) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!team.isVerified) {
            return res.status(403).json({ error: 'Team is not verified by administration yet.' });
        }

        const isPasswordValid = await bcrypt.compare(password, team.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { teamId: team._id, email: team.teamLeaderEmail },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        // Set token in HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(200).json({
            message: 'Login successful',
            team: {
                id: team._id,
                teamName: team.teamName,
                teamLeaderEmail: team.teamLeaderEmail
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const logoutTeam = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

export const loginAdmin = (req, res) => {
    try {
        const { email, password } = req.body;
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@codequest.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        if (email === adminEmail && password === adminPassword) {
            const token = jwt.sign(
                { role: 'admin', email },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '24h' }
            );

            res.cookie('adminToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            res.status(200).json({ message: 'Admin logged in successful' });
        } else {
            res.status(401).json({ error: 'Invalid admin credentials' });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const logoutAdmin = (req, res) => {
    res.clearCookie('adminToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
    });
    res.status(200).json({ message: 'Admin logged out' });
};

export const getProfile = async (req, res) => {
    try {
        const team = await Team.findById(req.team.teamId).select('-password');
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.status(200).json({ team });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
