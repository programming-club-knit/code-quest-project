import mongoose from "mongoose";

const riddleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        default: 50
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

const Riddle = mongoose.model("Riddle", riddleSchema);

export default Riddle;
