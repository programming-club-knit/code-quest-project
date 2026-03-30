import mongoose from 'mongoose';

const systemSchema = new mongoose.Schema({
    contestStatus: {
        type: String,
        enum: ['not_started', 'running', 'paused', 'ended'],
        default: 'not_started'
    },
    contestStartTime: { type: Date },
    timeoutMinutes: { type: Number, default: 30 },
    penaltyMinutes: { type: Number, default: 15 },
    contestDurationMinutes: { type: Number, default: 120 }
}, { timestamps: true });

// There should only be one system settings document.
const System = mongoose.model('System', systemSchema);

export default System;