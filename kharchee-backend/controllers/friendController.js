const Friend = require("../models/Friend");

/* ===============================
   ADD FRIEND
================================ */
exports.addFriend = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Friend name is required"
            });
        }

        const friend = await Friend.create({
            user: req.user._id,
            name: name.trim()
        });

        res.status(201).json(friend);

    } catch (error) {
        // Duplicate friend name per user
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Friend already exists"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
};

/* ===============================
   GET FRIENDS (USER-SCOPED)
================================ */
exports.getFriends = async (req, res) => {
    try {
        const friends = await Friend.find({
            user: req.user._id
        }).sort({ updatedAt: -1 });

        res.json(friends);
    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
};

/* ===============================
   UPDATE AMOUNT (ADD OR REPLACE)
================================ */
exports.updateAmount = async (req, res) => {
    try {
        const { amount, description, mode } = req.body;

        if (typeof amount !== "number") {
            return res.status(400).json({
                message: "Invalid amount"
            });
        }

        const friend = await Friend.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!friend) {
            return res.status(404).json({
                message: "Friend not found"
            });
        }

        let historyAmount;

        if (mode === "replace") {
            // 🔁 Replace total
            historyAmount = amount - friend.currentAmount;
            friend.currentAmount = amount;
        } else {
            // ➕ Default = add/subtract
            historyAmount = amount;
            friend.currentAmount += amount;
        }

        // Save history entry (NEWEST ON TOP)
        friend.history.unshift({
            amount: historyAmount,
            type: "transaction",
            description: description?.trim() || ""
        });

        await friend.save();

        res.json(friend);

    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
};

/* ===============================
   🗑️ CLEAR FRIEND HISTORY (NEW)
================================ */
exports.clearHistory = async (req, res) => {
    try {
        const friend = await Friend.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!friend) {
            return res.status(404).json({
                message: "Friend not found"
            });
        }

        // Clear only history (do NOT touch currentAmount)
        friend.history = [];

        await friend.save();

        res.json({
            message: "History cleared successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
};

/* ===============================
   💰 SETTLE FRIEND (NEW)
================================ */
exports.settleFriend = async (req, res) => {
    try {
        const friend = await Friend.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!friend) {
            return res.status(404).json({
                message: "Friend not found"
            });
        }

        // If already settled
        if (friend.currentAmount === 0) {
            return res.status(400).json({
                message: "Already settled"
            });
        }

        const settlementAmount = -friend.currentAmount;

        // Add settlement history entry (NEWEST ON TOP)
        friend.history.unshift({
            amount: settlementAmount,
            type: "settlement",
            description: "Settlement completed"
        });

        // Reset balance
        friend.currentAmount = 0;

        await friend.save();

        res.json({
            message: "Settlement successful",
            friend
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
};


/* ===============================
   DELETE FRIEND
================================ */
exports.deleteFriend = async (req, res) => {
    try {
        const friend = await Friend.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!friend) {
            return res.status(404).json({
                message: "Friend not found"
            });
        }

        res.json({ message: "Friend deleted" });

    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
};
