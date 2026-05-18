const express = require("express");
const { createEmployee, getEmployees, searchEmployees } = require("../controllers/candidateController");
const protect = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, createEmployee);
router.get("/", protect, getEmployees);
router.get("/search", protect, searchEmployees);

module.exports = router;
