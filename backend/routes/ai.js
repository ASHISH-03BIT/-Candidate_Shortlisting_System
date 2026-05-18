const express = require("express");
const { recommendEmployees, shortlistWithAI } = require("../controllers/aiController");
const protect = require("../middleware/auth");

const router = express.Router();

router.post("/recommend", protect, recommendEmployees);
router.post("/shortlist", protect, shortlistWithAI);

module.exports = router;
