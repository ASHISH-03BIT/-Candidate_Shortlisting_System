const tierClass = (tier) => {
  if (tier === "High") return "high";
  if (tier === "Medium") return "medium";
  return "low";
};

function ShortlistResults({ results }) {
  if (!results?.length) return <p className="muted">Run a basic shortlist to see ranked candidates.</p>;

  return (
    <div className="results-list">
      {results.map((candidate) => (
        <article className="result-card" key={candidate._id || candidate.email}>
          <div className="card-header">
            <div>
              <h3>{candidate.name}</h3>
              <p>{candidate.email}</p>
            </div>
            <span className={`badge ${tierClass(candidate.tier)}`}>{candidate.tier}</span>
          </div>
          <div className="score-row">
            <strong>{candidate.matchScore}%</strong>
            <span>Match Score</span>
          </div>
          <div className="tag-row">
            {(candidate.matchedSkills || []).map((skill) => <span className="skill-tag matched" key={skill}>{skill}</span>)}
          </div>
        </article>
      ))}
    </div>
  );
}

export default ShortlistResults;
