const express = require("express");
const { recommendEmployees, shortlistWithAI } = require("../controllers/aiController");

const router = express.Router();

router.post("/recommend", recommendEmployees);
router.post("/shortlist", shortlistWithAI);

module.exports = router;
