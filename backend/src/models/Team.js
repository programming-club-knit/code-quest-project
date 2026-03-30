import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNo: { type: String },
    email: { type: String }
});

const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: true,
        unique: true
    },
    teamLeaderName: {
        type: String,
        required: true
    },
    teamLeaderEmail: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    rollNo: {
        type: String,
        required: true
    },
    mobileNo: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isDisqualified: {
        type: Boolean,
        default: false
    },
    riddleSequence: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Riddle'
    }],
    problemSequence: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
    }],
    solvedRiddles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Riddle'
    }],
    solvedProblems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
    }],
    penaltyUnlock: {
        triggered: { type: Boolean, default: false },
        triggeredAt: { type: Date },
        riddleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Riddle' }
    },
    permanentlyLockedRiddles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Riddle'
    }],
    teamMembers: [teamMemberSchema]
},
    { timestamps: true });

// Basic indexes to speed up dashboards and tracking
teamSchema.index({ isVerified: 1 });
teamSchema.index({ isDisqualified: 1 });
teamSchema.index({ solvedProblems: 1 });

export default mongoose.model('Team', teamSchema);
