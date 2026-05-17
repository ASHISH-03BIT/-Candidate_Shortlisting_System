const express = require("express");
const { shortlistWithAI } = require("../controllers/aiController");

const router = express.Router();

router.post("/shortlist", shortlistWithAI);

module.exports = router;
