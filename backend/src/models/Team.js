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
    solvedRiddles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Riddle'
    }],
    solvedProblems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
    }],
    teamMembers: [teamMemberSchema]
},
    { timestamps: true });

export default mongoose.model('Team', teamSchema);
