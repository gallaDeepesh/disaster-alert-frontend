import { useState, useEffect } from "react";
import "./CSS/AdminDashboard.css";
import apiService from "../services/api.js"; // your existing api service

const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: "◈" },
  { key: "disasters", label: "Disasters", icon: "⚡" },
  { key: "alerts", label: "Alerts", icon: "◉" },
  { key: "requests", label: "Rescue Requests", icon: "🆘" }, // Added this
  { key: "tasks", label: "Rescue Tasks", icon: "◎" },
  { key: "responders", label: "Responders", icon: "◷" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [disasters, setDisasters] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [responders, setResponders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertModal, setAlertModal] = useState(false);
  const [alertForm, setAlertForm] = useState({ disasterId: "", message: "" ,region:""});
  const [toastMsg, setToastMsg] = useState(null);
  const [ticker, setTicker] = useState(0);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => setTicker((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === "disasters" && disasters.length === 0) fetchDisasters();
    if (activeTab === "alerts" && alerts.length === 0) fetchAlerts();
    if (activeTab === "tasks" && tasks.length === 0) fetchTasks();
    if (activeTab === "responders" && responders.length === 0) fetchResponders();
    if (activeTab === "requests" && requests.length === 0) fetchRequests(); // Added this
  }, [activeTab]);


  async function fetchAll() {
  setLoading(true);
  try {
    const [s, d, a, t, r, req] = await Promise.all([
      apiService.get("/api/admin/dashboard"),
      apiService.get("/api/admin/disasters"),
      apiService.get("/api/admin/alerts"),
      apiService.get("/api/admin/rescue-tasks"),
      apiService.get("/api/admin/responders"),
      apiService.get("/api/admin/rescue-request"), // New call
    ]);
    setStats(s.data);
    setDisasters(d.data);
    setAlerts(a.data);
    setTasks(t.data);
    setResponders(r.data);
    setRequests(req.data); // Set state
  } catch (e) {
    showToast("Failed to load dashboard data", "error");
  } finally {
    setLoading(false);
  }
}
  //Toggle Theme Function
  function toggleTheme() {
  const newTheme = theme === "dark" ? "light" : "dark";
  setTheme(newTheme);
  localStorage.setItem("theme", newTheme);
}
  async function fetchDisasters() {
    try {
      const res = await apiService.get("/api/admin/disasters");
      setDisasters(res.data);
    } catch {}
  }

  async function fetchAlerts() {
    try {
      const res = await apiService.get("/api/admin/alerts");
      setAlerts(res.data);
    } catch {}
  }

  async function fetchTasks() {
    try {
      const res = await apiService.get("/api/admin/rescue-tasks");
      setTasks(res.data);
    } catch {}
  }

  async function fetchResponders() {
    try {
      const res = await apiService.get("/api/admin/responders");
      setResponders(res.data);
    } catch {}
  }
// New function to fetch rescue requests
  async function fetchRequests() {
  try {
    const res = await apiService.get("/api/admin/rescue-request");
    setRequests(res.data);
  } catch (err) {
    showToast("Failed to load rescue requests", "error");
  }
}

  async function handleCreateAlert(e) {
    e.preventDefault();
    try {
      await apiService.post("/api/admin/create-alert", alertForm);
      showToast("Alert broadcast successfully", "success");
      setAlertModal(false);
      setAlertForm({ disasterId: "", message: "" });
      fetchAlerts();
    } catch {
      showToast("Failed to create alert", "error");
    }
  }

  function showToast(msg, type = "success") {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3500);
  }

  const statCards = stats
    ? [
        { label: "Active Disasters", value: stats.disasters, icon: "⚡", color: "red" },
        { label: "Alerts Issued", value: stats.alerts, icon: "◉", color: "amber" },
        { label: "Rescue Tasks", value: stats.tasks, icon: "◎", color: "blue" },
        { label: "Responders", value: stats.responders, icon: "◷", color: "green" },
      ]
    : [];

  return (
    <div className= {`admin-root ${theme}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">⬡</span>
          <div>
            <div className="brand-title">NEXUS</div>
            <div className="brand-sub">Emergency Command</div>
          </div>
        </div>

        <div className="sidebar-status">
          <span className="status-dot pulse" />
          <span>SYSTEM OPERATIONAL</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${activeTab === item.key ? "active" : ""}`}
              onClick={() => setActiveTab(item.key)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {activeTab === item.key && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="broadcast-btn" onClick={() => setAlertModal(true)}>
            <span>◉</span> Broadcast Alert
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <div className="header-breadcrumb">Admin / {NAV_ITEMS.find((n) => n.key === activeTab)?.label}</div>
            <h1 className="header-title">{NAV_ITEMS.find((n) => n.key === activeTab)?.label}</h1>
          </div>
          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === "dark" ? "☀ Light" : "🌙 Dark"}
            </button>
            <div className="live-clock">
              <span className="clock-dot" />
              LIVE · {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <button className="refresh-btn" onClick={fetchAll}>↻ Refresh</button>
          </div>
        </header>

        <div className="admin-content">
          {loading ? (
            <div className="loading-state">
              <div className="loader" />
              <p>Loading command data…</p>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <OverviewTab stats={statCards} disasters={disasters} alerts={alerts} tasks={tasks} />
              )}
              {activeTab === "requests" && <RequestsTab requests={requests} />}
              {activeTab === "disasters" && <DisastersTab disasters={disasters} />}
              {activeTab === "alerts" && <AlertsTab alerts={alerts} />}
              {activeTab === "tasks" && <TasksTab tasks={tasks} />}
              {activeTab === "responders" && <RespondersTab responders={responders} />}
            </>
          )}
        </div>
      </main>

      {/* Create Alert Modal */}
      {alertModal && (
        <div className="modal-overlay" onClick={() => setAlertModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon">◉</span>
              <h2>Broadcast Emergency Alert</h2>
              <button className="modal-close" onClick={() => setAlertModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateAlert} className="modal-form">
            <label>
              Disaster ID
              <input
                type="number"
                placeholder="Enter disaster ID"
                value={alertForm.disasterId}
                onChange={(e) => setAlertForm({ ...alertForm, disasterId: e.target.value })}
                required
              />
            </label>

              {/* Added Region Label and Input */}
            <label>
              Region
              <input
                type="text"
                placeholder="Enter affected region (e.g. Coastal, Downtown)"
                value={alertForm.region}
                onChange={(e) => setAlertForm({ ...alertForm, region: e.target.value })}
                required
              />
            </label>

            <label>
               Alert Message
               <textarea
                  placeholder="Describe the emergency situation…"
                  value={alertForm.message}
                  onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                  rows={4}
                  required
                />
              </label>
  
              <button type="submit">Create Alert</button>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setAlertModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  ◉ Broadcast Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className={`toast toast-${toastMsg.type}`}>
          <span>{toastMsg.type === "success" ? "✓" : "✕"}</span>
          {toastMsg.msg}
        </div>
      )}
    </div>
  );
}

/* ─── Overview Tab ─── */
function OverviewTab({ stats, disasters, alerts, tasks }) {
  return (
    <div className="overview-grid">
      <div className="stat-cards">
        {stats.map((s) => (
          <div className={`stat-card stat-${s.color}`} key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-bar"><div className="stat-bar-fill" /></div>
          </div>
        ))}
      </div>

      <div className="overview-panels">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-icon">⚡</span> Recent Disasters
          </div>
          <div className="panel-list">
            {disasters.slice(0, 5).map((d, i) => (
              <div className="panel-row" key={i}>
                <span className={`severity-badge sev-${(d.severity || "").toLowerCase()}`}>
                  {d.severity || "—"}
                </span>
                <span className="panel-row-name">{d.name || d.type || "Unknown"}</span>
                <span className="panel-row-loc">{d.location || "—"}</span>
              </div>
            ))}
            {disasters.length === 0 && <div className="empty-row">No disasters recorded</div>}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span className="panel-icon">◉</span> Recent Alerts
          </div>
          <div className="panel-list">
            {alerts.slice(0, 5).map((a, i) => (
              <div className="panel-row" key={i}>
                <span className="alert-dot" />
                <span className="panel-row-name">{a.message?.slice(0, 50) || "No message"}…</span>
                <span className="panel-row-loc">
                  {a.broadcastTime ? new Date(a.broadcastTime).toLocaleDateString() : "—"}
                </span>
              </div>
            ))}
            {alerts.length === 0 && <div className="empty-row">No alerts issued</div>}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span className="panel-icon">◎</span> Active Tasks
          </div>
          <div className="panel-list">
            {tasks.slice(0, 5).map((t, i) => (
              <div className="panel-row" key={i}>
                <span className={`task-badge task-${(t.status || "").toLowerCase()}`}>
                  {t.status || "PENDING"}
                </span>
                <span className="panel-row-name">{t.description?.slice(0, 45) || "Task"}</span>
              </div>
            ))}
            {tasks.length === 0 && <div className="empty-row">No active tasks</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Disasters Tab ─── */
function DisastersTab({ disasters }) {
  return (
    <div className="table-section">
      <div className="table-toolbar">
        <span>{disasters.length} records</span>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th><th>Type</th><th>Name</th><th>Location</th><th>Severity</th><th>Reported At</th>
            </tr>
          </thead>
          <tbody>
            {disasters.map((d, i) => (
              <tr key={i}>
                <td className="td-id">#{d.id}</td>
                <td><span className="type-chip">{d.type}</span></td>
                <td>{d.name || "—"}</td>
                <td>{d.location || "—"}</td>
                <td><span className={`severity-badge sev-${(d.severity || "").toLowerCase()}`}>{d.severity || "—"}</span></td>
                <td className="td-date">{d.reportedAt ? new Date(d.reportedAt).toLocaleString() : "—"}</td>
              </tr>
            ))}
            {disasters.length === 0 && (
              <tr><td colSpan={6} className="empty-cell">No disasters found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Alerts Tab ─── */
function AlertsTab({ alerts }) {
  return (
    <div className="table-section">
      <div className="table-toolbar">
        <span>{alerts.length} alerts issued</span>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>ID</th><th>Message</th><th>Disaster</th><th>Broadcast Time</th></tr>
          </thead>
          <tbody>
            {alerts.map((a, i) => (
              <tr key={i}>
                <td className="td-id">#{a.id}</td>
                <td className="td-msg">{a.message || "—"}</td>
                <td>{a.disaster?.name || a.disaster?.type || a.disasterId || "—"}</td>
                <td className="td-date">
                  {a.broadcastTime ? new Date(a.broadcastTime).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
            {alerts.length === 0 && (
              <tr><td colSpan={4} className="empty-cell">No alerts issued</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Tasks Tab ─── */
function TasksTab({ tasks }) {
  return (
    <div className="table-section">
      <div className="table-toolbar">
        <span>{tasks.length} tasks total</span>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>ID</th><th>Description</th><th>Assigned To</th><th>Status</th><th>Priority</th></tr>
          </thead>
          <tbody>
            {tasks.map((t, i) => (
              <tr key={i}>
                <td className="td-id">#{t.id}</td>
                <td className="td-msg">{t.description || "—"}</td>
                <td>{t.assignedTo?.name || t.assignedTo?.email || "Unassigned"}</td>
                <td><span className={`task-badge task-${(t.status || "pending").toLowerCase()}`}>{t.status || "PENDING"}</span></td>
                <td><span className={`severity-badge sev-${(t.priority || "").toLowerCase()}`}>{t.priority || "—"}</span></td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr><td colSpan={5} className="empty-cell">No tasks assigned</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Responders Tab ─── */
function RespondersTab({ responders }) {
  return (
    <div className="table-section">
      <div className="table-toolbar">
        <span>{responders.length} responders registered</span>
      </div>
      <div className="responders-grid">
        {responders.map((r, i) => (
          <div className="responder-card" key={i}>
            <div className="responder-avatar">
              {(r.name || r.email || "?")[0].toUpperCase()}
            </div>
            <div className="responder-info">
              <div className="responder-name">{r.name || "Unknown"}</div>
              <div className="responder-email">{r.email}</div>
              <div className="responder-meta">
                <span className={`task-badge task-${(r.status || "active").toLowerCase()}`}>
                  {r.status || "ACTIVE"}
                </span>
              </div>
            </div>
          </div>
        ))}
        {responders.length === 0 && (
          <div className="empty-row">No responders registered</div>
        )}
      </div>
    </div>

    );

    /* ─── Rescue Requests Tab ─── */
function RequestsTab({ requests }) {
  return (
    <div className="table-section">
      <div className="table-toolbar">
        <span>{requests.length} incoming help requests</span>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Citizen</th>
              <th>Location</th>
              <th>Description</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, i) => (
              <tr key={i}>
                <td className="td-id">#{req.id}</td>
                <td>{req.citizenName || req.user?.name || "Anonymous"}</td>
                <td>{req.location || "Unknown"}</td>
                <td className="td-msg">{req.description || "No details provided"}</td>
                <td>
                  <span className={`task-badge task-${(req.status || "new").toLowerCase()}`}>
                    {req.status || "NEW"}
                  </span>
                </td>
                <td className="td-date">
                  {req.createdAt ? new Date(req.createdAt).toLocaleString() : "Recently"}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr><td colSpan={6} className="empty-cell">No help requests found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
}
