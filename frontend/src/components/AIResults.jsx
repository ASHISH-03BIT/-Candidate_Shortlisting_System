function AIResults({ results }) {
  if (!results?.length) return <p className="muted">Run an AI shortlist to see recruiter AI recommendations.</p>;

  return (
    <div className="results-list">
      {results.map((candidate) => (
        <article className="result-card ai-card" key={`${candidate.name}-${candidate.rank}`}>
          <div className="card-header">
            <div>
              <span className="rank-badge">#{candidate.rank}</span>
              <h3>{candidate.name}</h3>
            </div>
            <span className="badge high">{candidate.aiScore}% AI Score</span>
          </div>
          <p className="ai-reason">“{candidate.reason}”</p>
          <div className="tag-row">
            {(candidate.skills || []).map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)}
          </div>
        </article>
      ))}
    </div>
  );
}

export default AIResults;
