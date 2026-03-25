import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
    input: String,
    expectedOutput: String,
    actualOutput: String,
    status: String,
    statusId: Number,
    isHidden: Boolean,
    passed: Boolean
});

const submissionSchema = new mongoose.Schema({
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    code: { type: String, required: true },
    languageId: { type: Number, required: true }, // Judge0 language ID
    results: [resultSchema],
    verdict: { type: String, enum: ['Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded', 'Compilation Error', 'Judge Error', 'Failed'], default: 'Failed' },
    executionTime: { type: Number }, // in seconds
    memory: { type: Number } // in KB
}, { timestamps: true });

export default mongoose.model('Submission', submissionSchema);
