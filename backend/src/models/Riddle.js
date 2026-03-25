import mongoose from 'mongoose';

const riddleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    points: {
        type: Number,
        required: true,
        default: 10
    },
    answer: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

const Riddle = mongoose.model('Riddle', riddleSchema);

export default Riddle;
