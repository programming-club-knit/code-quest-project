import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false }
});

const problemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    inputFormat: { type: String, required: true },
    outputFormat: { type: String, required: true },
    constraints: { type: String, required: true },
    riddleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Riddle', required: true }, // The riddle this problem unlocks
    points: { type: Number, default: 100 },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    timeLimit: { type: Number, default: 2.0 }, // In seconds, to be passed to Judge0
    memoryLimit: { type: Number, default: 256000 }, // In KB (256MB), to be passed to Judge0
    testCases: [testCaseSchema],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Problem', problemSchema);
