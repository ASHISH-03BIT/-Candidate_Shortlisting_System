import { useState } from "react";
import CandidateForm from "./components/CandidateForm.jsx";
import CandidateList from "./components/CandidateList.jsx";
import JobForm from "./components/JobForm.jsx";
import AuthForm from "./components/AuthForm.jsx";

const tabs = [
  { id: "add", label: "Add Employee" },
  { id: "view", label: "Employee List" },
  { id: "shortlist", label: "Performance Ranking" },
  { id: "ai", label: "AI Recommendations" }
];

function App() {
  const [activeTab, setActiveTab] = useState("add");
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("employeeAnalyticsUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const logout = () => {
    localStorage.removeItem("employeeAnalyticsToken");
    localStorage.removeItem("employeeAnalyticsUser");
    setUser(null);
  };

  if (!user) return <AuthForm onAuth={setUser} />;

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
          <strong>{user.name}</strong>
          <span>{user.email}</span>
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
