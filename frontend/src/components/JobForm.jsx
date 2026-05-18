import { useState } from "react";
import api from "../api.js";
import ShortlistResults from "./ShortlistResults.jsx";
import AIResults from "./AIResults.jsx";

const parseSkills = (value) => value.split(",").map((skill) => skill.trim()).filter(Boolean);

function JobForm({ mode = "basic" }) {
  const [requiredSkills, setRequiredSkills] = useState("");
  const [preferredSkills, setPreferredSkills] = useState("");
  const [minExperience, setMinExperience] = useState("");
  const [basicResults, setBasicResults] = useState([]);
  const [aiResults, setAiResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const payload = {
    requiredSkills: parseSkills(requiredSkills),
    preferredSkills: parseSkills(preferredSkills),
    minExperience: Number(minExperience || 0)
  };

  const runBasicRanking = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/match", payload);
      setBasicResults(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Performance ranking failed.");
    } finally {
      setLoading(false);
    }
  };

  const runAIRecommendations = async () => {
    setLoading(true);
    setError("");
    try {
      const employeesResponse = await api.get("/api/employees");
      const { data } = await api.post("/api/ai/recommend", { employees: employeesResponse.data });
      setAiResults(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || "AI recommendation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (mode === "ai") runAIRecommendations();
    else runBasicRanking();
  };

  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Performance analytics</p>
        <h2>{mode === "ai" ? "AI Recommendation Display" : "Employee Performance Ranking"}</h2>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        {mode === "basic" && (
          <>
            <label>
              Required Skills
              <input value={requiredSkills} onChange={(event) => setRequiredSkills(event.target.value)} required placeholder="Leadership, React" />
            </label>
            <label>
              Min Experience
              <input type="number" min="0" step="0.5" value={minExperience} onChange={(event) => setMinExperience(event.target.value)} required />
            </label>
            <label className="full-width">
              Preferred Skills
              <input value={preferredSkills} onChange={(event) => setPreferredSkills(event.target.value)} placeholder="Mentoring, Analytics (optional)" />
            </label>
          </>
        )}
        <div className="button-row full-width">
          {mode === "basic" && <button className="primary-button" type="button" disabled={loading} onClick={runBasicRanking}>Run Ranking</button>}
          <button className="secondary-button" type="button" disabled={loading} onClick={runAIRecommendations}>AI Recommendations</button>
        </div>
      </form>
      {loading && <div className="spinner-wrap"><span className="spinner" /> <span>{mode === "ai" ? "AI is preparing employee recommendations..." : "Ranking employees..."}</span></div>}
      {error && <div className="toast error">{error}</div>}
      <div className="split-results">
        {(mode === "basic" || basicResults.length > 0) && <ShortlistResults results={basicResults} />}
        {(mode === "ai" || aiResults.length > 0) && <AIResults results={aiResults} />}
      </div>
    </section>
  );
}

export default JobForm;
