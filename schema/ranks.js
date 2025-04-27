import mongoose from 'mongoose';

const rankSchema = new mongoose.Schema({
    rankName: {
        type: String,
        required: true,
        trim: true
    },
    abbreviation: {
        type: String,
        required: true,
        trim: true
    },
    levelOfficer: {
        type: Boolean,
        required: true
    },
    seniorityLevel: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Rank = mongoose.model('Rank', rankSchema);
export default Rank;