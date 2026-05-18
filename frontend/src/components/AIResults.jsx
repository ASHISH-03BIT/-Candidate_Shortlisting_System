function AIResults({ results }) {
  if (!results?.length) return <p className="muted">Run AI recommendations to see promotion guidance, ranking, training suggestions, and feedback.</p>;

  return (
    <div className="results-list">
      {results.map((employee) => (
        <article className="result-card ai-card" key={`${employee.employeeName}-${employee.rank}`}>
          <div className="card-header">
            <div>
              <span className="rank-badge">#{employee.rank}</span>
              <h3>{employee.employeeName}</h3>
            </div>
            <span className="badge high">{employee.aiScore}% AI Score</span>
          </div>
          <p><strong>Promotion:</strong> {employee.promotionRecommendation}</p>
          <p className="ai-reason">“{employee.feedback}”</p>
          <div className="tag-row">
            {(employee.trainingSuggestions || []).map((item) => <span className="skill-tag" key={item}>{item}</span>)}
          </div>
        </article>
      ))}
    </div>
  );
}

export default AIResults;
