import { useState, useEffect, useCallback } from "react";
import "./CSS/ResponderDashboard.css";
import responderService from "../services/responderService.js"; // adjust path

/* ── Tiny SVG Icons ──────────────────────────────────────────────────────── */
const Icon = {
  Close:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Refresh: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  Sun:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Moon:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  Check:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
};

const TABS = [
  { key: "overview", label: "Overview",   icon: "⌂"  },
  { key: "alerts",   label: "Alerts",     icon: "◉"  },
  { key: "tasks",    label: "My Tasks",   icon: "◎"  },
  { key: "report",   label: "Submit Report", icon: "📋" },
  { key: "history",  label: "History",    icon: "🕓" },
];

const STATUS_OPTIONS = ["IN_PROGRESS", "COMPLETED", "PENDING", "CANCELLED"];

const STATUS_META = {
  COMPLETED:   { label: "Completed",   cls: "st-completed"   },
  IN_PROGRESS: { label: "In Progress", cls: "st-inprogress"  },
  PENDING:     { label: "Pending",     cls: "st-pending"     },
  CANCELLED:   { label: "Cancelled",   cls: "st-cancelled"   },
};

export default function ResponderDashboard() {
  const [theme, setTheme]           = useState(() => localStorage.getItem("rsp-theme") || "light");
  const [activeTab, setActiveTab]   = useState("overview");
  const [alerts, setAlerts]         = useState([]);
  const [tasks, setTasks]           = useState([]);
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState(null);

  // Report modal
  const [reportModal, setReportModal] = useState(false);
  const [reportForm, setReportForm]   = useState({ disasterId: "", details: "" });
  const [submitting, setSubmitting]   = useState(false);

  // Task status update modal
  const [taskModal, setTaskModal]   = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStatus, setNewStatus]   = useState("");

  // Ack loading per alert
  const [ackLoading, setAckLoading] = useState({});

  useEffect(() => {
    document.documentElement.setAttribute("data-rsp-theme", theme);
    localStorage.setItem("rsp-theme", theme);
  }, [theme]);

  useEffect(() => { fetchAll(); }, []);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [a, t, h] = await Promise.all([
        responderService.getActiveAlerts(),
        responderService.getMyTasks(),
        responderService.getCompletedTasks(),
      ]);
      setAlerts(a.data  || []);
      setTasks(t.data   || []);
      setHistory(h.data || []);
    } catch {
      showToast("Failed to load data. Please refresh.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleAcknowledge(alertId) {
    setAckLoading(p => ({ ...p, [alertId]: true }));
    try {
      const res = await responderService.acknowledgeAlert(alertId);
      showToast(res.data || "Alert acknowledged ✓", "success");
      fetchAll();
    } catch {
      showToast("Failed to acknowledge alert.", "error");
    } finally {
      setAckLoading(p => ({ ...p, [alertId]: false }));
    }
  }

  function openTaskModal(task) {
    setSelectedTask(task);
    setNewStatus(task.status || "IN_PROGRESS");
    setTaskModal(true);
  }

  async function handleUpdateStatus(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await responderService.updateTaskStatus(selectedTask.id, newStatus);
      showToast("Task status updated!", "success");
      setTaskModal(false);
      fetchAll();
    } catch {
      showToast("Failed to update task.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitReport(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await responderService.submitReport({
        disasterId: parseInt(reportForm.disasterId),
        details: reportForm.details,
      });
      showToast("Report submitted successfully!", "success");
      setReportModal(false);
      setReportForm({ disasterId: "", details: "" });
    } catch {
      showToast("Failed to submit report.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const pendingTasks    = tasks.filter(t => t.status !== "COMPLETED" && t.status !== "CANCELLED");
  const completedToday  = history.filter(t => {
    if (!t.updatedAt) return false;
    const d = new Date(t.updatedAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  return (
    <div className="rsp-root" data-rsp-theme={theme}>

      {/* ── Top Bar ── */}
      <header className="rsp-topbar">
        <div className="rsp-brand">
          <span className="rsp-brand-icon">🚨</span>
          <div>
            <div className="rsp-brand-name">SENTINEL</div>
            <div className="rsp-brand-sub">Responder Command</div>
          </div>
        </div>

        <div className="rsp-topbar-right">
          {alerts.length > 0 && (
            <div className="rsp-alert-pill">
              <span className="rsp-pill-dot" />
              {alerts.length} Active Alert{alerts.length > 1 ? "s" : ""}
            </div>
          )}
          <button className="rsp-icon-btn" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} title="Toggle theme">
            {theme === "dark" ? <Icon.Sun /> : <Icon.Moon />}
          </button>
          <button className="rsp-icon-btn" onClick={fetchAll} title="Refresh">
            <Icon.Refresh />
          </button>
        </div>
      </header>

      <div className="rsp-body">

        {/* ── Side Nav ── */}
        <nav className="rsp-sidenav">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`rsp-navbtn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="rsp-navbtn-icon">{tab.icon}</span>
              <span className="rsp-navbtn-label">{tab.label}</span>
              {tab.key === "alerts" && alerts.length > 0 && (
                <span className="rsp-navbtn-badge">{alerts.length}</span>
              )}
              {tab.key === "tasks" && pendingTasks.length > 0 && (
                <span className="rsp-navbtn-badge amber">{pendingTasks.length}</span>
              )}
            </button>
          ))}

          <div className="rsp-nav-divider" />

          <button
            className="rsp-report-shortcut"
            onClick={() => setReportModal(true)}
          >
            <span>📋</span>
            <span>Quick Report</span>
          </button>
        </nav>

        {/* ── Main ── */}
        <main className="rsp-main">
          {loading ? (
            <div className="rsp-loading">
              <div className="rsp-spinner" />
              <p>Loading responder data…</p>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <OverviewTab
                  alerts={alerts}
                  tasks={tasks}
                  history={history}
                  completedToday={completedToday}
                  pendingTasks={pendingTasks}
                  onAck={handleAcknowledge}
                  ackLoading={ackLoading}
                  onUpdateTask={openTaskModal}
                  onReport={() => setReportModal(true)}
                />
              )}
              {activeTab === "alerts" && (
                <AlertsTab
                  alerts={alerts}
                  onAck={handleAcknowledge}
                  ackLoading={ackLoading}
                />
              )}
              {activeTab === "tasks" && (
                <TasksTab
                  tasks={tasks}
                  onUpdate={openTaskModal}
                />
              )}
              {activeTab === "report" && (
                <ReportTab onOpen={() => setReportModal(true)} />
              )}
              {activeTab === "history" && (
                <HistoryTab history={history} />
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Bottom Nav (mobile) ── */}
      <nav className="rsp-bottomnav">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`rsp-bottombtn ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Update Task Status Modal ── */}
      {taskModal && selectedTask && (
        <div className="rsp-overlay" onClick={() => setTaskModal(false)}>
          <div className="rsp-modal" onClick={e => e.stopPropagation()}>
            <div className="rsp-modal-header amber">
              <span className="rsp-modal-icon">◎</span>
              <h2>Update Task Status</h2>
              <button className="rsp-modal-close" onClick={() => setTaskModal(false)}><Icon.Close /></button>
            </div>
            <div className="rsp-modal-body">
              <div className="rsp-task-preview">
                <div className="rsp-task-preview-label">Task</div>
                <div className="rsp-task-preview-desc">{selectedTask.description || "No description"}</div>
              </div>
              <form onSubmit={handleUpdateStatus} className="rsp-modal-form">
                <div className="rsp-field">
                  <label>New Status</label>
                  <div className="rsp-status-grid">
                    {STATUS_OPTIONS.map(s => {
                      const meta = STATUS_META[s] || { label: s, cls: "st-pending" };
                      return (
                        <button
                          type="button"
                          key={s}
                          className={`rsp-status-btn ${newStatus === s ? "selected" : ""} ${meta.cls}`}
                          onClick={() => setNewStatus(s)}
                        >
                          {s === "COMPLETED"   && "✅ "}
                          {s === "IN_PROGRESS" && "🔄 "}
                          {s === "PENDING"     && "⏳ "}
                          {s === "CANCELLED"   && "❌ "}
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="rsp-modal-actions">
                  <button type="button" className="rsp-btn-secondary" onClick={() => setTaskModal(false)}>Cancel</button>
                  <button type="submit" className="rsp-btn-primary" disabled={submitting}>
                    {submitting ? "Saving…" : "◎ Update Status"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Submit Report Modal ── */}
      {reportModal && (
        <div className="rsp-overlay" onClick={() => setReportModal(false)}>
          <div className="rsp-modal" onClick={e => e.stopPropagation()}>
            <div className="rsp-modal-header">
              <span className="rsp-modal-icon">📋</span>
              <h2>Submit Field Report</h2>
              <button className="rsp-modal-close" onClick={() => setReportModal(false)}><Icon.Close /></button>
            </div>
            <div className="rsp-modal-body">
              <form onSubmit={handleSubmitReport} className="rsp-modal-form">
                <div className="rsp-field">
                  <label>Disaster ID</label>
                  <input
                    type="number"
                    placeholder="Enter disaster ID"
                    value={reportForm.disasterId}
                    onChange={e => setReportForm(f => ({ ...f, disasterId: e.target.value }))}
                    required
                  />
                </div>
                <div className="rsp-field">
                  <label>Report Details</label>
                  <textarea
                    placeholder="Describe current on-ground situation, casualties, resource needs, accessibility…"
                    rows={5}
                    value={reportForm.details}
                    onChange={e => setReportForm(f => ({ ...f, details: e.target.value }))}
                    required
                  />
                </div>
                <div className="rsp-modal-actions">
                  <button type="button" className="rsp-btn-secondary" onClick={() => setReportModal(false)}>Cancel</button>
                  <button type="submit" className="rsp-btn-primary" disabled={submitting}>
                    {submitting ? "Submitting…" : "📋 Submit Report"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`rsp-toast rsp-toast-${toast.type}`}>
          <span>{toast.type === "success" ? "✓" : toast.type === "info" ? "i" : "✕"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ═══════════════ Sub-pages ═══════════════════════════════════════════════ */

/* ── Overview ── */
function OverviewTab({ alerts, tasks, history, completedToday, pendingTasks, onAck, ackLoading, onUpdateTask, onReport }) {
  const urgentAlerts = alerts.filter(a => a.severity === "CRITICAL" || a.severity === "HIGH");

  return (
    <div className="rsp-overview">

      {/* Stat cards */}
      <div className="rsp-stat-row">
        <div className="rsp-stat-card danger">
          <div className="rsp-stat-icon">◉</div>
          <div className="rsp-stat-num">{alerts.length}</div>
          <div className="rsp-stat-lbl">Active Alerts</div>
        </div>
        <div className="rsp-stat-card amber">
          <div className="rsp-stat-icon">◎</div>
          <div className="rsp-stat-num">{pendingTasks.length}</div>
          <div className="rsp-stat-lbl">Pending Tasks</div>
        </div>
        <div className="rsp-stat-card success">
          <div className="rsp-stat-icon">✓</div>
          <div className="rsp-stat-num">{completedToday}</div>
          <div className="rsp-stat-lbl">Completed Today</div>
        </div>
        <div className="rsp-stat-card blue">
          <div className="rsp-stat-icon">🕓</div>
          <div className="rsp-stat-num">{history.length}</div>
          <div className="rsp-stat-lbl">Total Completed</div>
        </div>
      </div>

      {/* Urgent alerts banner */}
      {urgentAlerts.length > 0 && (
        <div className="rsp-urgent-banner">
          <span className="rsp-urgent-icon">⚠️</span>
          <div>
            <strong>{urgentAlerts.length} critical/high-severity alert{urgentAlerts.length > 1 ? "s" : ""} require your attention</strong>
            <p>Acknowledge these alerts to confirm you have received them.</p>
          </div>
        </div>
      )}

      <div className="rsp-overview-cols">
        {/* Active alerts */}
        <div className="rsp-panel">
          <div className="rsp-panel-header">
            <span>◉</span> Active Alerts
            <span className="rsp-panel-count">{alerts.length}</span>
          </div>
          <div className="rsp-panel-body">
            {alerts.slice(0, 4).map((a, i) => (
              <div className="rsp-panel-row" key={i}>
                <span className="rsp-pulse-dot" />
                <div className="rsp-panel-row-info">
                  <span className="rsp-panel-row-title">{a.message?.slice(0, 55) || "Alert"}{a.message?.length > 55 ? "…" : ""}</span>
                  <span className="rsp-panel-row-meta">{a.broadcastTime ? new Date(a.broadcastTime).toLocaleDateString() : "—"}</span>
                </div>
                <button
                  className="rsp-ack-btn"
                  onClick={() => onAck(a.id)}
                  disabled={ackLoading[a.id]}
                  title="Acknowledge"
                >
                  {ackLoading[a.id] ? "…" : <Icon.Check />}
                </button>
              </div>
            ))}
            {alerts.length === 0 && <div className="rsp-empty-row">No active alerts</div>}
          </div>
        </div>

        {/* My tasks */}
        <div className="rsp-panel">
          <div className="rsp-panel-header">
            <span>◎</span> My Tasks
            <span className="rsp-panel-count">{pendingTasks.length}</span>
          </div>
          <div className="rsp-panel-body">
            {tasks.slice(0, 4).map((t, i) => {
              const meta = STATUS_META[t.status] || { label: t.status, cls: "st-pending" };
              return (
                <div className="rsp-panel-row" key={i}>
                  <span className={`rsp-status-dot ${meta.cls}`} />
                  <div className="rsp-panel-row-info">
                    <span className="rsp-panel-row-title">{t.description?.slice(0, 50) || "Task"}</span>
                    <span className={`rsp-status-pill ${meta.cls}`}>{meta.label}</span>
                  </div>
                  <button className="rsp-edit-btn" onClick={() => onUpdateTask(t)} title="Update status">✏️</button>
                </div>
              );
            })}
            {tasks.length === 0 && <div className="rsp-empty-row">No tasks assigned</div>}
          </div>
        </div>
      </div>

      {/* Quick action */}
      <div className="rsp-quick-action" onClick={onReport}>
        <span>📋</span>
        <div>
          <strong>Submit a Field Report</strong>
          <p>Report current on-ground situation to the command center</p>
        </div>
        <span className="rsp-arrow">→</span>
      </div>
    </div>
  );
}

/* ── Alerts Tab ── */
function AlertsTab({ alerts, onAck, ackLoading }) {
  return (
    <div className="rsp-tab-content">
      <div className="rsp-tab-header">
        <h2>Active Alerts</h2>
        <span className="rsp-count-badge danger">{alerts.length}</span>
      </div>
      {alerts.length === 0 ? (
        <div className="rsp-empty">
          <span>◉</span>
          <p>No active alerts at this time.</p>
        </div>
      ) : (
        <div className="rsp-cards-list">
          {alerts.map((a, i) => (
            <div className="rsp-card" key={i}>
              <div className="rsp-card-top">
                <span className="rsp-pulse-dot" />
                <span className="rsp-card-title">{a.message}</span>
                <button
                  className={`rsp-btn-ack ${ackLoading[a.id] ? "loading" : ""}`}
                  onClick={() => onAck(a.id)}
                  disabled={ackLoading[a.id]}
                >
                  {ackLoading[a.id] ? "…" : "✓ Acknowledge"}
                </button>
              </div>
              <div className="rsp-card-meta">
                {a.broadcastTime && <span>📅 {new Date(a.broadcastTime).toLocaleString()}</span>}
                {a.disaster && <span>⚡ {a.disaster.type || "Disaster"}</span>}
                {a.severity  && <span className={`rsp-sev-pill sev-${a.severity.toLowerCase()}`}>{a.severity}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Tasks Tab ── */
function TasksTab({ tasks, onUpdate }) {
  const [filter, setFilter] = useState("ALL");
  const filtered = filter === "ALL" ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="rsp-tab-content">
      <div className="rsp-tab-header">
        <h2>My Tasks</h2>
        <span className="rsp-count-badge amber">{tasks.length}</span>
      </div>

      {/* Filter pills */}
      <div className="rsp-filter-row">
        {["ALL", ...STATUS_OPTIONS].map(f => (
          <button
            key={f}
            className={`rsp-filter-pill ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "ALL" ? "All" : STATUS_META[f]?.label || f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rsp-empty">
          <span>◎</span>
          <p>No tasks matching this filter.</p>
        </div>
      ) : (
        <div className="rsp-cards-list">
          {filtered.map((t, i) => {
            const meta = STATUS_META[t.status] || { label: t.status, cls: "st-pending" };
            return (
              <div className="rsp-card" key={i}>
                <div className="rsp-card-top">
                  <span className={`rsp-status-dot ${meta.cls}`} />
                  <span className="rsp-card-title">{t.description || "Task"}</span>
                  <button className="rsp-btn-edit" onClick={() => onUpdate(t)}>✏️ Update</button>
                </div>
                <div className="rsp-card-meta">
                  <span className={`rsp-status-pill ${meta.cls}`}>{meta.label}</span>
                  {t.updatedAt && <span>🕓 {new Date(t.updatedAt).toLocaleString()}</span>}
                  {t.disaster  && <span>⚡ {t.disaster.type || "Disaster"}</span>}
                  {t.priority  && <span className={`rsp-sev-pill sev-${t.priority.toLowerCase()}`}>{t.priority}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Report Tab ── */
function ReportTab({ onOpen }) {
  return (
    <div className="rsp-tab-content">
      <div className="rsp-tab-header"><h2>Submit Report</h2></div>
      <div className="rsp-report-hero">
        <div className="rsp-report-icon">📋</div>
        <h3>File a Field Report</h3>
        <p>
          Submit accurate on-ground reports to help the command center make better decisions.
          Include details on casualties, infrastructure damage, resource needs, and accessibility.
        </p>
        <button className="rsp-btn-primary rsp-btn-lg" onClick={onOpen}>
          📋 Create Report
        </button>
      </div>
      <div className="rsp-report-tips">
        <h4>📌 What to include in a good report:</h4>
        <ul>
          <li>🔢 Number of people affected or rescued</li>
          <li>🏗 Infrastructure damage (roads, bridges, buildings)</li>
          <li>💧 Availability of water, food, medical supplies</li>
          <li>🚗 Road accessibility for emergency vehicles</li>
          <li>⚠️ Ongoing hazards or secondary threats</li>
          <li>📞 Communication status at the site</li>
        </ul>
      </div>
    </div>
  );
}

/* ── History Tab ── */
function HistoryTab({ history }) {
  return (
    <div className="rsp-tab-content">
      <div className="rsp-tab-header">
        <h2>Completed Tasks</h2>
        <span className="rsp-count-badge success">{history.length}</span>
      </div>
      {history.length === 0 ? (
        <div className="rsp-empty">
          <span>🕓</span>
          <p>No completed tasks yet.</p>
        </div>
      ) : (
        <div className="rsp-cards-list">
          {history.map((t, i) => (
            <div className="rsp-card rsp-card-done" key={i}>
              <div className="rsp-card-top">
                <span className="rsp-done-icon">✅</span>
                <span className="rsp-card-title">{t.description || "Task"}</span>
                <span className="rsp-status-pill st-completed">Completed</span>
              </div>
              <div className="rsp-card-meta">
                {t.updatedAt && <span>✓ Completed on {new Date(t.updatedAt).toLocaleString()}</span>}
                {t.disaster  && <span>⚡ {t.disaster.type || "Disaster"}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
