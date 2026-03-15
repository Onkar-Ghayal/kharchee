const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
    addFriend,
    getFriends,
    updateAmount,
    deleteFriend,
    clearHistory,
    settleFriend
} = require("../controllers/friendController");

/* ===============================
   FRIEND ROUTES
================================ */

// ➕ Add new friend
router.post("/", protect, addFriend);

// 📄 Get all friends
router.get("/", protect, getFriends);

// 💰 Add / Replace amount
router.put("/:id/amount", protect, updateAmount);

// 🤝 Settle friend (NEW)
router.put("/:id/settle", protect, settleFriend);

// 🗑️ Clear history
router.delete("/:id/history", protect, clearHistory);

// ❌ Delete friend
router.delete("/:id", protect, deleteFriend);

module.exports = router;
