const tierClass = (tier) => {
  if (tier === "High") return "high";
  if (tier === "Medium") return "medium";
  return "low";
};

function ShortlistResults({ results }) {
  if (!results?.length) return <p className="muted">Run a performance ranking to see ranked employees.</p>;

  return (
    <div className="results-list">
      {results.map((employee) => (
        <article className="result-card" key={employee._id || employee.email}>
          <div className="card-header">
            <div>
              <h3>{employee.employeeName || employee.name}</h3>
              <p>{employee.department}</p>
            </div>
            <span className={`badge ${tierClass(employee.tier)}`}>{employee.tier}</span>
          </div>
          <div className="score-row">
            <strong>{employee.matchScore}%</strong>
            <span>combined skill and performance score</span>
          </div>
          <p className="bio">Performance: {employee.performanceScore}% • Experience: {employee.yearsOfExperience || employee.experience} years</p>
          <div className="tag-row">
            {(employee.skills || []).map((skill) => (
              <span className={(employee.matchedSkills || []).includes(skill) ? "skill-tag matched" : "skill-tag"} key={skill}>{skill}</span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

export default ShortlistResults;
