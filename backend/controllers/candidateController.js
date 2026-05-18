const Employee = require("../models/Employee");

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) return [];
  return skills.map((skill) => String(skill).trim()).filter(Boolean);
};

const employeePayload = (body) => ({
  employeeName: body.employeeName || body.name,
  email: body.email,
  department: body.department,
  skills: normalizeSkills(body.skills),
  performanceScore: body.performanceScore,
  yearsOfExperience: body.yearsOfExperience ?? body.experience
});

exports.createEmployee = async (req, res, next) => {
  try {
    const payload = employeePayload(req.body);

    if (payload.performanceScore === undefined || payload.performanceScore === "") {
      return res.status(400).json({ message: "Performance score is required." });
    }

    const existingEmployee = await Employee.findOne({ email: payload.email });
    if (existingEmployee) {
      return res.status(409).json({ message: "An employee with this email already exists." });
    }

    const employee = await Employee.create({
      ...payload,
      performanceScore: Number(payload.performanceScore),
      yearsOfExperience: Number(payload.yearsOfExperience || 0)
    });

    return res.status(201).json(employee);
  } catch (error) {
    return next(error);
  }
};

exports.getEmployees = async (_req, res, next) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    return res.json(employees);
  } catch (error) {
    return next(error);
  }
};

exports.searchEmployees = async (req, res, next) => {
  try {
    const { department } = req.query;
    const query = department ? { department: new RegExp(`^${escapeRegExp(department)}$`, "i") } : {};
    const employees = await Employee.find(query).sort({ performanceScore: -1, createdAt: -1 });
    return res.json(employees);
  } catch (error) {
    return next(error);
  }
};

exports.createCandidate = exports.createEmployee;
exports.getCandidates = exports.getEmployees;
