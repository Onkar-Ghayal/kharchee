const mongoose = require("mongoose");

/* ===============================
   TRANSACTION HISTORY SCHEMA
================================ */
const historySchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: true
        },

        // transaction | settlement
        type: {
            type: String,
            enum: ["transaction", "settlement"],
            default: "transaction"
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        date: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);


/* ===============================
   FRIEND SCHEMA
================================ */
const friendSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        currentAmount: {
            type: Number,
            default: 0
        },
        history: {
            type: [historySchema],
            default: []
        }
    },
    { timestamps: true }
);

/* ===============================
   🔥 PRO-LEVEL INDEXES
================================ */

// Fast lookup of friends per user
friendSchema.index({ user: 1 });

// Prevent duplicate friend names PER USER
friendSchema.index(
    { user: 1, name: 1 },
    { unique: true }
);

module.exports = mongoose.model("Friend", friendSchema);
