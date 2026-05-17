import { useState } from "react";
import api from "../api.js";

const initialForm = { name: "", email: "", skills: "", experience: "", bio: "" };

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
      await api.post("/api/candidates", {
        ...form,
        experience: Number(form.experience),
        skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean)
      });
      setForm(initialForm);
      setStatus({ type: "success", message: "Candidate saved successfully." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Could not save candidate."
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Profile intake</p>
        <h2>Add Candidate</h2>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Name
          <input name="name" value={form.name} onChange={updateField} required placeholder="Ada Lovelace" />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={updateField} required placeholder="ada@example.com" />
        </label>
        <label>
          Skills
          <input name="skills" value={form.skills} onChange={updateField} required placeholder="React, Node.js, MongoDB" />
        </label>
        <label>
          Experience (years)
          <input name="experience" type="number" min="0" step="0.5" value={form.experience} onChange={updateField} required />
        </label>
        <label className="full-width">
          Bio
          <textarea name="bio" value={form.bio} onChange={updateField} rows="5" placeholder="Brief candidate summary" />
        </label>
        <button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Candidate"}</button>
      </form>
      {status && <div className={`toast ${status.type}`}>{status.message}</div>}
    </section>
  );
}

export default CandidateForm;
