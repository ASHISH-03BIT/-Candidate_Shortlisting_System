const express = require("express");
const { createEmployee, getEmployees, searchEmployees } = require("../controllers/candidateController");

const router = express.Router();

router.post("/", createEmployee);
router.get("/", getEmployees);
router.get("/search", searchEmployees);

module.exports = router;
