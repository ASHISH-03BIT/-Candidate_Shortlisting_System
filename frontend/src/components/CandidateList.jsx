import { useEffect, useState } from "react";
import api from "../api.js";

function CandidateList() {
  const [employees, setEmployees] = useState([]);
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [score, setScore] = useState("");

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

  const startEditing = (employee) => {
    setEditingId(employee._id);
    setScore(String(employee.performanceScore));
  };

  const updatePerformanceScore = async (employee) => {
    setError("");
    try {
      const { data } = await api.put(`/api/employees/${employee._id}`, { performanceScore: Number(score) });
      setEmployees((current) => current.map((item) => (item._id === employee._id ? data : item)));
      setEditingId(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update performance score.");
    }
  };

  const deleteEmployee = async (employee) => {
    setError("");
    try {
      await api.delete(`/api/employees/${employee._id}`);
      setEmployees((current) => current.filter((item) => item._id !== employee._id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete employee.");
    }
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
            {editingId === employee._id ? (
              <div className="inline-edit">
                <input type="number" min="0" max="100" value={score} onChange={(event) => setScore(event.target.value)} aria-label="Performance score" />
                <button className="primary-button" type="button" onClick={() => updatePerformanceScore(employee)}>Save</button>
                <button className="secondary-button" type="button" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            ) : (
              <div className="button-row card-actions">
                <button className="secondary-button" type="button" onClick={() => startEditing(employee)}>Update Score</button>
                <button className="danger-button" type="button" onClick={() => deleteEmployee(employee)}>Delete</button>
              </div>
            )}
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
