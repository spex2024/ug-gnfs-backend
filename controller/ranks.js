import Rank from '../schema/ranks.js';

export const createRank = async (req, res) => {
    try {
        const { rankName, abbreviation, levelOfficer, seniorityLevel } = req.body;
        const rank = await Rank.create({ rankName, abbreviation, levelOfficer, seniorityLevel });
        res.status(201).json(rank);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create rank' });
    }
};

export const getAllRanks = async (req, res) => {
    try {
        const ranks = await Rank.find().sort({ seniorityLevel: 1 });
        res.status(200).json(ranks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ranks' });
    }
};

export const getRankById = async (req, res) => {
    try {
        const rank = await Rank.findById(req.params.id);
        if (!rank) {
            return res.status(404).json({ error: 'Rank not found' });
        }
        res.status(200).json(rank);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving rank' });
    }
};

export const updateRank = async (req, res) => {
    try {
        const updatedRank = await Rank.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedRank) {
            return res.status(404).json({ error: 'Rank not found' });
        }
        res.status(200).json(updatedRank);
    } catch (error) {
        res.status(500).json({ error: 'Error updating rank' });
    }
};

export const deleteRank = async (req, res) => {
    try {
        const deleted = await Rank.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Rank not found' });
        }
        res.status(200).json({ message: 'Rank deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting rank' });
    }
};
