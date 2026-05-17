import { useEffect, useState } from "react";
import axios from "axios";

function CandidateList() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const { data } = await axios.get("/api/candidates");
        setCandidates(data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load candidates.");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  if (loading) return <div className="panel muted">Loading candidates...</div>;
  if (error) return <div className="toast error">{error}</div>;

  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Talent database</p>
        <h2>All Candidates</h2>
      </div>
      <div className="card-grid">
        {candidates.map((candidate) => (
          <article className="candidate-card" key={candidate._id || candidate.email}>
            <div className="card-header">
              <div>
                <h3>{candidate.name}</h3>
                <p>{candidate.email}</p>
              </div>
              <span className="badge experience">{candidate.experience} yrs</span>
            </div>
            <div className="tag-row">
              {(candidate.skills || []).map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)}
            </div>
            {candidate.bio && <p className="bio">{candidate.bio}</p>}
          </article>
        ))}
        {!candidates.length && <p className="muted">No candidates added yet.</p>}
      </div>
    </section>
  );
}

export default CandidateList;
