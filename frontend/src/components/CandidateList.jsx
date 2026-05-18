import { useEffect, useState } from "react";
import api from "../api.js";

function CandidateList() {
  const [employees, setEmployees] = useState([]);
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEmployees = async (departmentFilter = "") => {
    setLoading(true);
    setError("");
    try {
      const endpoint = departmentFilter ? `/api/employees/search?department=${encodeURIComponent(departmentFilter)}` : "/api/employees";
      const { data } = await api.get(endpoint);
      setEmployees(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchEmployees(department.trim());
  };

  if (loading) return <div className="panel muted">Loading employees...</div>;
  if (error) return <div className="toast error">{error}</div>;

  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Employee database</p>
        <h2>Employee List</h2>
      </div>
      <form className="search-row" onSubmit={handleSearch}>
        <input value={department} onChange={(event) => setDepartment(event.target.value)} placeholder="Filter by department" />
        <button className="primary-button" type="submit">Search</button>
        <button className="secondary-button" type="button" onClick={() => { setDepartment(""); fetchEmployees(); }}>Clear</button>
      </form>
      <div className="card-grid">
        {employees.map((employee) => (
          <article className="candidate-card" key={employee._id || employee.email}>
            <div className="card-header">
              <div>
                <h3>{employee.employeeName}</h3>
                <p>{employee.email}</p>
              </div>
              <span className="badge high">{employee.performanceScore}%</span>
            </div>
            <p className="bio"><strong>{employee.department}</strong> • {employee.yearsOfExperience} years experience</p>
            <div className="tag-row">
              {(employee.skills || []).map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)}
            </div>
          </article>
        ))}
        {!employees.length && <p className="muted">No employees found.</p>}
      </div>
    </section>
  );
}

export default CandidateList;
