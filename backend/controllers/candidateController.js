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


exports.updateEmployee = async (req, res, next) => {
  try {
    const payload = employeePayload(req.body);
    const update = {};

    if (payload.employeeName !== undefined) update.employeeName = payload.employeeName;
    if (payload.email !== undefined) update.email = payload.email;
    if (payload.department !== undefined) update.department = payload.department;
    if (req.body.skills !== undefined) update.skills = payload.skills;
    if (payload.performanceScore !== undefined && payload.performanceScore !== "") update.performanceScore = Number(payload.performanceScore);
    if (payload.yearsOfExperience !== undefined && payload.yearsOfExperience !== "") update.yearsOfExperience = Number(payload.yearsOfExperience);

    const employee = await Employee.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!employee) return res.status(404).json({ message: "Employee not found." });

    return res.json(employee);
  } catch (error) {
    return next(error);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found." });

    return res.json({ message: "Employee removed successfully." });
  } catch (error) {
    return next(error);
  }
};
