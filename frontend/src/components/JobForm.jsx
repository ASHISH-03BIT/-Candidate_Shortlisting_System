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

  const runBasicShortlist = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/match", payload);
      setBasicResults(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Basic shortlist failed.");
    } finally {
      setLoading(false);
    }
  };

  const runAIShortlist = async () => {
    setLoading(true);
    setError("");
    try {
      const candidatesResponse = await api.get("/api/candidates");
      const { data } = await api.post("/api/ai/shortlist", {
        requiredSkills: payload.requiredSkills,
        minExperience: payload.minExperience,
        candidates: candidatesResponse.data
      });
      setAiResults(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || "AI shortlist failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (mode === "ai") runAIShortlist();
    else runBasicShortlist();
  };

  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Role requirements</p>
        <h2>{mode === "ai" ? "AI Match" : "Shortlist"}</h2>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Required Skills
          <input value={requiredSkills} onChange={(event) => setRequiredSkills(event.target.value)} required placeholder="React, Node.js" />
        </label>
        <label>
          Min Experience
          <input type="number" min="0" step="0.5" value={minExperience} onChange={(event) => setMinExperience(event.target.value)} required />
        </label>
        <label className="full-width">
          Preferred Skills
          <input value={preferredSkills} onChange={(event) => setPreferredSkills(event.target.value)} placeholder="AWS, TypeScript (optional)" />
        </label>
        <div className="button-row full-width">
          <button className="primary-button" type="button" disabled={loading} onClick={runBasicShortlist}>Basic Shortlist</button>
          <button className="secondary-button" type="button" disabled={loading} onClick={runAIShortlist}>AI Shortlist</button>
        </div>
      </form>
      {loading && <div className="spinner-wrap"><span className="spinner" /> <span>{mode === "ai" ? "AI is ranking candidates..." : "Matching candidates..."}</span></div>}
      {error && <div className="toast error">{error}</div>}
      <div className="split-results">
        {(mode === "basic" || basicResults.length > 0) && <ShortlistResults results={basicResults} />}
        {(mode === "ai" || aiResults.length > 0) && <AIResults results={aiResults} />}
      </div>
    </section>
  );
}

export default JobForm;
