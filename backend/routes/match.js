const express = require("express");
const { matchCandidates } = require("../controllers/matchController");

const router = express.Router();

router.post("/", matchCandidates);

module.exports = router;
