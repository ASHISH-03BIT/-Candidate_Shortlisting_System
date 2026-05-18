import { useState } from "react";
import api from "../api.js";

function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const payload = mode === "signup" ? form : { email: form.email, password: form.password };
      const { data, status } = await api.post(endpoint, payload);

      if (mode === "signup") {
        if (status === 201 && data.message) {
          setMessage(data.message);
          setMode("login");
          setForm((current) => ({ ...current, password: "" }));
        }
        return;
      }

      if (data.message) {
        setMessage(data.message);
      }

      if (data.token && data.user) {
        localStorage.setItem("employeeAnalyticsToken", data.token);
        localStorage.setItem("employeeAnalyticsUser", JSON.stringify(data.user));
        onAuth(data.user);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="panel auth-panel">
        <div className="section-heading">
          <p className="eyebrow">Secure HR workspace</p>
          <h2>{mode === "signup" ? "Create Account" : "Login"}</h2>
          <p className="muted">Sign in to manage employee analytics and AI recommendations.</p>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label className="full-width">
              Name
              <input name="name" value={form.name} onChange={updateField} required placeholder="HR Manager" />
            </label>
          )}
          <label className="full-width">
            Email
            <input name="email" type="email" value={form.email} onChange={updateField} required placeholder="hr@example.com" />
          </label>
          <label className="full-width">
            Password
            <input name="password" type="password" value={form.password} onChange={updateField} required placeholder="••••••••" />
          </label>
          <button className="primary-button" type="submit" disabled={loading}>{loading ? "Please wait..." : mode === "signup" ? "Sign Up" : "Login"}</button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              setMode(mode === "signup" ? "login" : "signup");
              setError("");
              setMessage("");
            }}
          >
            Switch to {mode === "signup" ? "Login" : "Signup"}
          </button>
        </form>
        {message && <div className="toast success">{message}</div>}
        {error && <div className="toast error">{error}</div>}
      </section>
    </main>
  );
}

export default AuthForm;
