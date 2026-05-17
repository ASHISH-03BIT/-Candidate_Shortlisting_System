const Candidate = require("../models/Candidate");

const normalize = (items = []) => items.map((item) => String(item).trim()).filter(Boolean);
const normalizeLower = (items = []) => normalize(items).map((item) => item.toLowerCase());

const getOriginalMatchedSkills = (candidateSkills, targetSkillsLower) => {
  const targets = new Set(targetSkillsLower);
  return normalize(candidateSkills).filter((skill) => targets.has(skill.toLowerCase()));
};

exports.matchCandidates = async (req, res) => {
  try {
    const requiredSkills = normalize(req.body.requiredSkills);
    const preferredSkills = normalize(req.body.preferredSkills || []);
    const minExperience = Number(req.body.minExperience || 0);

    if (!requiredSkills.length) {
      return res.status(400).json({ message: "At least one required skill is needed." });
    }

    const requiredLower = normalizeLower(requiredSkills);
    const preferredLower = normalizeLower(preferredSkills);

    const candidates = await Candidate.find({ experience: { $gte: minExperience } }).lean();

    const results = candidates
      .map((candidate) => {
        const matchedRequired = getOriginalMatchedSkills(candidate.skills, requiredLower);
        const matchedPreferred = getOriginalMatchedSkills(candidate.skills, preferredLower);
        const baseScore = (matchedRequired.length / requiredSkills.length) * 100;
        const score = Math.min(100, Math.round(baseScore + matchedPreferred.length * 5));
        const tier = score >= 70 ? "High" : score >= 40 ? "Medium" : "Low";

        return {
          ...candidate,
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
    return res.status(500).json({ message: "Failed to match candidates.", error: error.message });
  }
};
