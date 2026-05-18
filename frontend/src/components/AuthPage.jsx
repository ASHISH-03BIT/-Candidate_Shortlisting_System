import { useState } from "react";
import api from "../api.js";

function AuthPage({ onAuthenticated }) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const payload = isSignup ? form : { email: form.email, password: form.password };
      const { data } = await api.post(endpoint, payload);
      onAuthenticated(data);
    } catch (error) {
      setStatus(error.response?.data?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="panel auth-panel">
        <div className="section-heading">
          <p className="eyebrow">Secure HR access</p>
          <h2>{isSignup ? "Create Admin Account" : "Admin Login"}</h2>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          {isSignup && (
            <label className="full-width">
              Name
              <input name="name" value={form.name} onChange={updateField} required placeholder="HR Admin" />
            </label>
          )}
          <label className="full-width">
            Email
            <input name="email" type="email" value={form.email} onChange={updateField} required placeholder="admin@example.com" />
          </label>
          <label className="full-width">
            Password
            <input name="password" type="password" minLength="6" value={form.password} onChange={updateField} required placeholder="Minimum 6 characters" />
          </label>
          <div className="button-row full-width">
            <button className="primary-button" type="submit" disabled={loading}>{loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}</button>
            <button className="secondary-button" type="button" onClick={() => setIsSignup((value) => !value)}>
              {isSignup ? "Use Login" : "Create Account"}
            </button>
          </div>
        </form>
        {status && <div className="toast error">{status}</div>}
      </section>
    </main>
  );
}

export default AuthPage;
