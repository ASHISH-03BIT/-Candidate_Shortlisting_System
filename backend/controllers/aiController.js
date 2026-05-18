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
        `${index + 1}. ${employee.employeeName || employee.name} | Department: ${employee.department} | Skills: ${(employee.skills || []).join(", ")} | Performance Score: ${employee.performanceScore} | Experience: ${employee.yearsOfExperience ?? employee.experience} years`
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

const getAiConfig = () => {
  const provider = (process.env.AI_PROVIDER || "openrouter").toLowerCase();
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.AI_BASE_URL || (provider === "openai" ? "https://api.openai.com/v1" : "https://openrouter.ai/api/v1")).replace(/\/$/, "");
  const model = process.env.AI_MODEL || (provider === "openai" ? "gpt-4o-mini" : "openai/gpt-4o-mini");

  return { apiKey, baseUrl, model, provider };
};

const buildAiHeaders = ({ apiKey, provider }) => ({
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
  ...(provider === "openrouter"
    ? {
        "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
        "X-Title": "Employee Performance Analytics System"
      }
    : {})
});

const parseProviderError = async (response, provider) => {
  const errorText = await response.text();
  let providerMessage = errorText;
  try {
    const parsed = JSON.parse(errorText);
    providerMessage = parsed?.error?.message || parsed?.message || errorText;
  } catch (_error) {
    providerMessage = errorText;
  }

  if (response.status === 401) {
    const authHelp = provider === "openrouter"
      ? "OpenRouter returned 401. Set a valid OPENROUTER_API_KEY from https://openrouter.ai/keys in backend/.env or your Render environment, then restart/redeploy the backend. Do not use an OpenAI key with the OpenRouter endpoint."
      : "The OpenAI-compatible provider returned 401. Check that the API key belongs to the configured AI_BASE_URL provider.";
    const error = new Error(`${authHelp} Provider message: ${providerMessage}`);
    error.statusCode = 401;
    return error;
  }

  const error = new Error(`${provider} request failed (${response.status}): ${providerMessage}`);
  error.statusCode = response.status >= 400 && response.status < 500 ? response.status : 502;
  return error;
};

exports.recommendEmployees = async (req, res, next) => {
  try {
    const { apiKey, baseUrl, model, provider } = getAiConfig();
    if (!apiKey || ["your_openrouter_key_here", "your_openai_key_here"].includes(apiKey)) {
      return res.status(500).json({
        message: "AI API key is not configured. Add OPENROUTER_API_KEY (or OPENAI_API_KEY with AI_PROVIDER=openai) to backend/.env or Render environment variables."
      });
    }

    const employees = Array.isArray(req.body.employees) && req.body.employees.length
      ? req.body.employees
      : await Employee.find().sort({ performanceScore: -1 }).lean();

    if (!employees.length) {
      return res.status(400).json({ message: "At least one employee is required for AI recommendations." });
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: buildAiHeaders({ apiKey, provider }),
      body: JSON.stringify({
        model,
        max_tokens: 1200,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: buildPrompt({ employees }) }]
      })
    });

    if (!response.ok) throw await parseProviderError(response, provider);

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
exports.getAiConfig = getAiConfig;
