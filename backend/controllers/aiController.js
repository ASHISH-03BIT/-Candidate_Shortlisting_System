const stripMarkdownFences = (content) =>
  String(content || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

const buildPrompt = ({ requiredSkills, minExperience, candidates }) => {
  const candidateLines = candidates
    .map(
      (candidate, index) =>
        `${index + 1}. ${candidate.name} | Skills: ${(candidate.skills || []).join(", ")} | Experience: ${candidate.experience} years | Bio: ${candidate.bio || ""}`
    )
    .join("\n");

  return `You are a technical recruiter AI.
Job requires: ${(requiredSkills || []).join(", ")} with ${minExperience}+ years experience.
Candidates:
${candidateLines}

For each candidate:
1. Score them 0-100 for fit
2. Write a 1-sentence explanation
3. Rank all candidates

Return ONLY valid JSON in this exact format:
{
  "ranked": [
    {
      "name": "...",
      "aiScore": 85,
      "reason": "...",
      "rank": 1
    }
  ]
}`;
};

exports.shortlistWithAI = async (req, res) => {
  try {
    const { requiredSkills = [], minExperience = 0, candidates = [] } = req.body;

    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "your_openrouter_key_here") {
      return res.status(500).json({ message: "OPENROUTER_API_KEY is not configured." });
    }

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ message: "At least one candidate is required for AI shortlisting." });
    }

    const prompt = buildPrompt({ requiredSkills, minExperience, candidates });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Candidate Shortlisting System"
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "openai/gpt-4o",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter request failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(stripMarkdownFences(rawContent));
    const ranked = Array.isArray(parsed.ranked) ? parsed.ranked : [];

    const candidatesByName = new Map(
      candidates.map((candidate) => [String(candidate.name || "").toLowerCase(), candidate])
    );

    const merged = ranked
      .map((result) => ({
        ...(candidatesByName.get(String(result.name || "").toLowerCase()) || {}),
        ...result,
        aiScore: Number(result.aiScore) || 0,
        rank: Number(result.rank) || 999
      }))
      .sort((a, b) => b.aiScore - a.aiScore || a.rank - b.rank);

    return res.json(merged);
  } catch (error) {
    return res.status(500).json({ message: "AI shortlisting failed.", error: error.message });
  }
};

exports.stripMarkdownFences = stripMarkdownFences;
exports.buildPrompt = buildPrompt;
