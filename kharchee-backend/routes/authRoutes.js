const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
    registerUser,
    loginUser,
    getProfile,
    updateProfile
} = require("../controllers/authController");

// ================= AUTH =================
router.post("/register", registerUser);
router.post("/login", loginUser);

// ================= PROFILE =================
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;