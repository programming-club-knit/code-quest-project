import jwt from 'jsonwebtoken';
import Team from '../models/Team.js';

export const verifyToken = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

        // Also ensure the team hasn't been soft-deleted or disqualified since token was issued
        const team = await Team.findById(decoded.teamId).select('isDeleted isDisqualified');
        if (!team || team.isDeleted || team.isDisqualified) {
            return res.status(403).json({ error: 'Team access has been revoked.' });
        }

        req.team = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

export const verifyAdmin = (req, res, next) => {
    const token = req.cookies.adminToken;

    if (!token) {
        return res.status(401).json({ error: 'Access denied. Administrator privileges required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden. Not an admin.' });
        }
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid admin token.' });
    }
};
