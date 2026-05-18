const Employee = require("../models/Employee");

const stripMarkdownFences = (content) =>
  String(content || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

const buildPrompt = ({ employees }) => {
  const employeeLines = employees
    .map(
      (employee, index) =>
        `${index + 1}. ${employee.employeeName || employee.name} | Department: ${employee.department} | Skills: ${(employee.skills || []).join(", ")} | Performance Score: ${employee.performanceScore} | Experience: ${employee.yearsOfExperience} years`
    )
    .join("\n");

  return `You are an HR analytics AI.
Employee performance data:
${employeeLines}

Suggest promotion readiness, employee ranking, training suggestions, and constructive AI feedback.
Return ONLY valid JSON in this exact format:
{
  "recommendations": [
    {
      "employeeName": "...",
      "rank": 1,
      "promotionRecommendation": "Promote | Consider | Not Ready",
      "trainingSuggestions": ["..."],
      "feedback": "...",
      "aiScore": 90
    }
  ]
}`;
};

exports.recommendEmployees = async (req, res, next) => {
  try {
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "your_openrouter_key_here") {
      return res.status(500).json({ message: "OPENROUTER_API_KEY is not configured." });
    }

    const employees = Array.isArray(req.body.employees) && req.body.employees.length
      ? req.body.employees
      : await Employee.find().sort({ performanceScore: -1 }).lean();

    if (!employees.length) {
      return res.status(400).json({ message: "At least one employee is required for AI recommendations." });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
        "X-Title": "Employee Performance Analytics System"
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "openai/gpt-4o",
        max_tokens: 1200,
        messages: [{ role: "user", content: buildPrompt({ employees }) }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter request failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(stripMarkdownFences(rawContent));
    const recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];

    return res.json(recommendations.sort((a, b) => Number(a.rank || 999) - Number(b.rank || 999)));
  } catch (error) {
    error.message = `AI recommendation failed. ${error.message}`;
    return next(error);
  }
};

exports.shortlistWithAI = exports.recommendEmployees;
exports.stripMarkdownFences = stripMarkdownFences;
exports.buildPrompt = buildPrompt;
