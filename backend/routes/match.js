const express = require("express");
const { matchCandidates } = require("../controllers/matchController");
const protect = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, matchCandidates);

module.exports = router;
