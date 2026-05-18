import { useState } from "react";
import api from "../api.js";

const initialForm = {
  employeeName: "",
  email: "",
  department: "",
  skills: "",
  performanceScore: "",
  yearsOfExperience: ""
};

function CandidateForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      await api.post("/api/employees", {
        ...form,
        performanceScore: Number(form.performanceScore),
        yearsOfExperience: Number(form.yearsOfExperience),
        skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean)
      });
      setForm(initialForm);
      setStatus({ type: "success", message: "Employee saved successfully." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Could not save employee."
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Employee intake</p>
        <h2>Employee Registration</h2>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Employee Name
          <input name="employeeName" value={form.employeeName} onChange={updateField} required placeholder="Ada Lovelace" />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={updateField} required placeholder="ada@example.com" />
        </label>
        <label>
          Department
          <input name="department" value={form.department} onChange={updateField} required placeholder="Engineering" />
        </label>
        <label>
          Skills
          <input name="skills" value={form.skills} onChange={updateField} required placeholder="React, Node.js, Analytics" />
        </label>
        <label>
          Performance Score
          <input name="performanceScore" type="number" min="0" max="100" value={form.performanceScore} onChange={updateField} required placeholder="0 - 100" />
        </label>
        <label>
          Years of Experience
          <input name="yearsOfExperience" type="number" min="0" step="0.5" value={form.yearsOfExperience} onChange={updateField} required />
        </label>
        <button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Employee"}</button>
      </form>
      {status && <div className={`toast ${status.type}`}>{status.message}</div>}
    </section>
  );
}

export default CandidateForm;
