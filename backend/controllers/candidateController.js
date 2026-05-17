const Candidate = require("../models/Candidate");

const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) return [];
  return skills.map((skill) => String(skill).trim()).filter(Boolean);
};

exports.createCandidate = async (req, res) => {
  try {
    const { name, email, skills, experience, bio = "" } = req.body;

    const candidate = await Candidate.create({
      name,
      email,
      skills: normalizeSkills(skills),
      experience,
      bio
    });

    return res.status(201).json(candidate);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A candidate with this email already exists." });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Failed to save candidate.", error: error.message });
  }
};

exports.getCandidates = async (_req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    return res.json(candidates);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch candidates.", error: error.message });
  }
};
