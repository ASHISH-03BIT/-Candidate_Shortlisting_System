const express = require("express");
const { createCandidate, getCandidates } = require("../controllers/candidateController");

const router = express.Router();

router.post("/", createCandidate);
router.get("/", getCandidates);

module.exports = router;
