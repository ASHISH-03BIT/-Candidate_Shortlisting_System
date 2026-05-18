const express = require("express");
const {
  createEmployee,
  deleteEmployee,
  getEmployees,
  searchEmployees,
  updateEmployee
} = require("../controllers/candidateController");

const router = express.Router();

router.post("/", createEmployee);
router.get("/", getEmployees);
router.get("/search", searchEmployees);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;
