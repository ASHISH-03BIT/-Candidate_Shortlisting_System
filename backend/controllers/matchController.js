const Employee = require("../models/Employee");

const normalize = (items = []) => items.map((item) => String(item).trim()).filter(Boolean);
const normalizeLower = (items = []) => normalize(items).map((item) => item.toLowerCase());

const getOriginalMatchedSkills = (employeeSkills, targetSkillsLower) => {
  const targets = new Set(targetSkillsLower);
  return normalize(employeeSkills).filter((skill) => targets.has(skill.toLowerCase()));
};

exports.matchCandidates = async (req, res, next) => {
  try {
    const requiredSkills = normalize(req.body.requiredSkills);
    const preferredSkills = normalize(req.body.preferredSkills || []);
    const minExperience = Number(req.body.minExperience || 0);

    if (!requiredSkills.length) {
      return res.status(400).json({ message: "At least one required skill is needed." });
    }

    const requiredLower = normalizeLower(requiredSkills);
    const preferredLower = normalizeLower(preferredSkills);

    const employees = await Employee.find({ yearsOfExperience: { $gte: minExperience } }).lean();

    const results = employees
      .map((employee) => {
        const matchedRequired = getOriginalMatchedSkills(employee.skills, requiredLower);
        const matchedPreferred = getOriginalMatchedSkills(employee.skills, preferredLower);
        const skillScore = (matchedRequired.length / requiredSkills.length) * 60;
        const performanceScore = Number(employee.performanceScore || 0) * 0.4;
        const score = Math.min(100, Math.round(skillScore + performanceScore + matchedPreferred.length * 3));
        const tier = score >= 75 ? "High" : score >= 50 ? "Medium" : "Low";

        return {
          ...employee,
          name: employee.employeeName,
          experience: employee.yearsOfExperience,
          matchScore: score,
          matchedSkills: [...new Set([...matchedRequired, ...matchedPreferred])],
          matchedRequired,
          matchedPreferred,
          tier
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    return res.json(results);
  } catch (error) {
    return next(error);
  }
};
