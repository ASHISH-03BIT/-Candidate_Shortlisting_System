import { useEffect, useState } from "react";
import AuthPage from "./components/AuthPage.jsx";
import CandidateForm from "./components/CandidateForm.jsx";
import CandidateList from "./components/CandidateList.jsx";
import JobForm from "./components/JobForm.jsx";
import { setAuthToken } from "./api.js";

const tabs = [
  { id: "add", label: "Add Employee" },
  { id: "view", label: "Employee List" },
  { id: "shortlist", label: "Performance Ranking" },
  { id: "ai", label: "AI Recommendations" }
];

const loadStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("authUser"));
  } catch (_error) {
    return null;
  }
};

function App() {
  const [activeTab, setActiveTab] = useState("add");
  const [auth, setAuth] = useState({ token: localStorage.getItem("authToken"), user: loadStoredUser() });

  useEffect(() => {
    setAuthToken(auth.token);
  }, [auth.token]);

  const handleAuthenticated = ({ token, user }) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", JSON.stringify(user));
    setAuth({ token, user });
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setAuth({ token: null, user: null });
  };

  if (!auth.token) return <AuthPage onAuthenticated={handleAuthenticated} />;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">AI</span>
          <div>
            <h1>Employee Analytics</h1>
            <p>Performance recommendations</p>
          </div>
        </div>
        <nav>
          {tabs.map((tab) => (
            <button
              className={activeTab === tab.id ? "active" : ""}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="user-card">
          <strong>{auth.user?.name || "Admin"}</strong>
          <span>{auth.user?.email}</span>
          <button className="secondary-button" type="button" onClick={logout}>Logout</button>
        </div>
      </aside>
      <section className="content">
        {activeTab === "add" && <CandidateForm />}
        {activeTab === "view" && <CandidateList />}
        {activeTab === "shortlist" && <JobForm mode="basic" />}
        {activeTab === "ai" && <JobForm mode="ai" />}
      </section>
    </main>
  );
}

export default App;
