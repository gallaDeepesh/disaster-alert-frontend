import { useState, useEffect, useCallback } from "react";
import "./CSS/CitizenDashboard.css";
import citizenService from "../services/citizenService.js"; // adjust path

// ─── Icons (inline SVG to avoid dependencies) ───────────────────────────────
const Icon = {
  Alert:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Disaster: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Help:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  Location: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Sun:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Moon:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  Refresh:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  Trash:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  Close:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  Map:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
};

const TABS = [
  { key: "home",     label: "Home",         icon: "home"     },
  { key: "alerts",   label: "My Alerts",    icon: "alert"    },
  { key: "disasters",label: "Nearby",       icon: "disaster" },
  { key: "help",     label: "Request Help", icon: "help"     },
  { key: "location", label: "My Location",  icon: "location" },
];

const SEVERITY_MAP = {
  CRITICAL: { label: "Critical", cls: "sev-critical" },
  HIGH:     { label: "High",     cls: "sev-high"     },
  MEDIUM:   { label: "Medium",   cls: "sev-medium"   },
  LOW:      { label: "Low",      cls: "sev-low"       },
};

export default function CitizenDashboard() {
  const [theme, setTheme]           = useState(() => localStorage.getItem("cit-theme") || "light");
  const [activeTab, setActiveTab]   = useState("home");
  const [alerts, setAlerts]         = useState([]);
  const [disasters, setDisasters]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState(null);
  const [helpModal, setHelpModal]   = useState(false);
  const [locModal, setLocModal]     = useState(false);
  const [helpForm, setHelpForm]     = useState({ description: "", type: "MEDICAL", location: "", latitude: "", longitude: "" });
  const [locForm, setLocForm]       = useState({ latitude: "", longitude: "" });
  const [submitting, setSubmitting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // apply theme to root
  useEffect(() => {
    document.documentElement.setAttribute("data-cit-theme", theme);
    localStorage.setItem("cit-theme", theme);
  }, [theme]);

  useEffect(() => { fetchAll(); }, []);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [a, d] = await Promise.all([
        citizenService.getAlerts(),
        citizenService.getNearbyDisasters(),
      ]);
      setAlerts(a.data || []);
      setDisasters(d.data || []);
    } catch {
      showToast("Could not load data. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestHelp(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await citizenService.requestHelp(helpForm);
      showToast("Help request sent! Responders have been notified.", "success");
      setHelpModal(false);
      setHelpForm({ description: "", type: "MEDICAL", location: "", latitude: "", longitude: "" });
    } catch {
      showToast("Failed to send request. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelRequest(id) {
    try {
      await citizenService.cancelRequest(id);
      showToast("Request cancelled.", "info");
      fetchAll();
    } catch {
      showToast("Failed to cancel request.", "error");
    }
  }

  async function handleUpdateLocation(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await citizenService.updateLocation(
        parseFloat(locForm.latitude),
        parseFloat(locForm.longitude)
      );
      showToast("Location updated successfully!", "success");
      setLocModal(false);
    } catch {
      showToast("Failed to update location.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function useGPS() {
    setGpsLoading(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setLocForm({ latitude: lat, longitude: lng });
        setHelpForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
        setGpsLoading(false);
        showToast("GPS location detected!", "success");
      },
      () => {
        setGpsLoading(false);
        showToast("GPS access denied. Enter manually.", "error");
      }
    );
  }

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  const activeAlerts   = alerts.filter(a => a.broadcastTime);
  const criticalCount  = disasters.filter(d => d.severity === "CRITICAL" || d.severity === "HIGH").length;

  return (
    <div className="cit-root" data-cit-theme={theme}>
      {/* ── Top Bar ── */}
      <header className="cit-topbar">
        <div className="cit-brand">
          <span className="cit-brand-icon">🛡</span>
          <div>
            <div className="cit-brand-name">SENTINEL</div>
            <div className="cit-brand-sub">Citizen Safety Portal</div>
          </div>
        </div>

        <div className="cit-topbar-right">
          {criticalCount > 0 && (
            <div className="cit-alert-badge">
              <span className="cit-badge-dot" />
              {criticalCount} Critical Alert{criticalCount > 1 ? "s" : ""} Nearby
            </div>
          )}
          <button className="cit-theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? <Icon.Sun /> : <Icon.Moon />}
          </button>
          <button className="cit-refresh-btn" onClick={fetchAll} title="Refresh data">
            <Icon.Refresh />
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="cit-body">
        {/* ── Sidebar Nav ── */}
        <nav className="cit-sidenav">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`cit-navbtn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="cit-navbtn-icon">
                {tab.icon === "home"     && "⌂"}
                {tab.icon === "alert"    && "◉"}
                {tab.icon === "disaster" && "⚡"}
                {tab.icon === "help"     && "✚"}
                {tab.icon === "location" && "◎"}
              </span>
              <span className="cit-navbtn-label">{tab.label}</span>
              {tab.key === "alerts" && activeAlerts.length > 0 && (
                <span className="cit-navbtn-badge">{activeAlerts.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* ── Main Panel ── */}
        <main className="cit-main">
          {loading ? (
            <div className="cit-loading">
              <div className="cit-spinner" />
              <p>Loading your safety data…</p>
            </div>
          ) : (
            <>
              {activeTab === "home"      && <HomeTab disasters={disasters} alerts={alerts} onHelpClick={() => setHelpModal(true)} />}
              {activeTab === "alerts"    && <AlertsTab alerts={alerts} />}
              {activeTab === "disasters" && <DisastersTab disasters={disasters} />}
              {activeTab === "help"      && <HelpTab onOpen={() => setHelpModal(true)} onCancel={handleCancelRequest} />}
              {activeTab === "location"  && <LocationTab onOpen={() => setLocModal(true)} useGPS={useGPS} gpsLoading={gpsLoading} />}
            </>
          )}
        </main>
      </div>

      {/* ── Bottom Nav (mobile) ── */}
      <nav className="cit-bottomnav">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`cit-bottombtn ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span>
              {tab.icon === "home"     && "⌂"}
              {tab.icon === "alert"    && "◉"}
              {tab.icon === "disaster" && "⚡"}
              {tab.icon === "help"     && "✚"}
              {tab.icon === "location" && "◎"}
            </span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Request Help Modal ── */}
      {helpModal && (
        <div className="cit-overlay" onClick={() => setHelpModal(false)}>
          <div className="cit-modal" onClick={e => e.stopPropagation()}>
            <div className="cit-modal-header danger">
              <span className="cit-modal-icon">✚</span>
              <h2>Request Emergency Help</h2>
              <button className="cit-modal-close" onClick={() => setHelpModal(false)}><Icon.Close /></button>
            </div>
            <form onSubmit={handleRequestHelp} className="cit-modal-form">
              <div className="cit-field">
                <label>Emergency Type</label>
                <div className="cit-type-grid">
                  {["MEDICAL","FIRE","FLOOD","EARTHQUAKE","RESCUE","OTHER"].map(t => (
                    <button
                      type="button"
                      key={t}
                      className={`cit-type-btn ${helpForm.type === t ? "selected" : ""}`}
                      onClick={() => setHelpForm(f => ({ ...f, type: t }))}
                    >
                      {t === "MEDICAL" && "🚑 "}
                      {t === "FIRE"    && "🔥 "}
                      {t === "FLOOD"   && "🌊 "}
                      {t === "EARTHQUAKE" && "⚡ "}
                      {t === "RESCUE"  && "🆘 "}
                      {t === "OTHER"   && "❗ "}
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="cit-field">
                <label>Describe your situation</label>
                <textarea
                  placeholder="Tell us what's happening…"
                  rows={3}
                  value={helpForm.description}
                  onChange={e => setHelpForm(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>
              <div className="cit-field">
                <label>Your Location (address or landmark)</label>
                <input
                  type="text"
                  placeholder="e.g. Near City Hospital, Main St"
                  value={helpForm.location}
                  onChange={e => setHelpForm(f => ({ ...f, location: e.target.value }))}
                />
              </div>
              <div className="cit-field-row">
                <div className="cit-field">
                  <label>Latitude</label>
                  <input type="number" step="any" placeholder="17.3850" value={helpForm.latitude}
                    onChange={e => setHelpForm(f => ({ ...f, latitude: e.target.value }))} />
                </div>
                <div className="cit-field">
                  <label>Longitude</label>
                  <input type="number" step="any" placeholder="78.4867" value={helpForm.longitude}
                    onChange={e => setHelpForm(f => ({ ...f, longitude: e.target.value }))} />
                </div>
                <button type="button" className="cit-gps-btn" onClick={useGPS} disabled={gpsLoading}>
                  {gpsLoading ? "…" : "📍 GPS"}
                </button>
              </div>
              <div className="cit-modal-actions">
                <button type="button" className="cit-btn-secondary" onClick={() => setHelpModal(false)}>Cancel</button>
                <button type="submit" className="cit-btn-danger" disabled={submitting}>
                  {submitting ? "Sending…" : "🆘 Send Help Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Update Location Modal ── */}
      {locModal && (
        <div className="cit-overlay" onClick={() => setLocModal(false)}>
          <div className="cit-modal" onClick={e => e.stopPropagation()}>
            <div className="cit-modal-header">
              <span className="cit-modal-icon">◎</span>
              <h2>Update My Location</h2>
              <button className="cit-modal-close" onClick={() => setLocModal(false)}><Icon.Close /></button>
            </div>
            <form onSubmit={handleUpdateLocation} className="cit-modal-form">
              <p className="cit-modal-hint">
                Keeping your location updated helps us alert you about disasters in your area.
              </p>
              <div className="cit-field-row">
                <div className="cit-field">
                  <label>Latitude</label>
                  <input type="number" step="any" placeholder="17.3850" value={locForm.latitude}
                    onChange={e => setLocForm(f => ({ ...f, latitude: e.target.value }))} required />
                </div>
                <div className="cit-field">
                  <label>Longitude</label>
                  <input type="number" step="any" placeholder="78.4867" value={locForm.longitude}
                    onChange={e => setLocForm(f => ({ ...f, longitude: e.target.value }))} required />
                </div>
                <button type="button" className="cit-gps-btn" onClick={useGPS} disabled={gpsLoading}>
                  {gpsLoading ? "…" : "📍 GPS"}
                </button>
              </div>
              <div className="cit-modal-actions">
                <button type="button" className="cit-btn-secondary" onClick={() => setLocModal(false)}>Cancel</button>
                <button type="submit" className="cit-btn-primary" disabled={submitting}>
                  {submitting ? "Saving…" : "◎ Update Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`cit-toast cit-toast-${toast.type}`}>
          <span>{toast.type === "success" ? "✓" : toast.type === "info" ? "i" : "✕"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ═══════════════ Sub-pages ═══════════════ */

function HomeTab({ disasters, alerts, onHelpClick }) {
  const critical = disasters.filter(d => ["CRITICAL","HIGH"].includes(d.severity));

  return (
    <div className="cit-home">
      {/* Hero banner */}
      <div className={`cit-hero ${critical.length > 0 ? "cit-hero-danger" : "cit-hero-safe"}`}>
        <div className="cit-hero-icon">{critical.length > 0 ? "⚠️" : "✅"}</div>
        <div>
          <h2>{critical.length > 0 ? `${critical.length} Active Threat${critical.length > 1 ? "s" : ""} Nearby` : "You're in a Safe Zone"}</h2>
          <p>{critical.length > 0 ? "Stay indoors and follow official guidance." : "No critical disasters detected in your area."}</p>
        </div>
        {critical.length > 0 && (
          <button className="cit-btn-danger hero-cta" onClick={onHelpClick}>Request Help</button>
        )}
      </div>

      {/* Quick stats */}
      <div className="cit-stat-row">
        <div className="cit-stat-card">
          <div className="cit-stat-num">{alerts.length}</div>
          <div className="cit-stat-lbl">Total Alerts</div>
        </div>
        <div className="cit-stat-card">
          <div className="cit-stat-num">{disasters.length}</div>
          <div className="cit-stat-lbl">Nearby Disasters</div>
        </div>
        <div className="cit-stat-card accent">
          <div className="cit-stat-num">{critical.length}</div>
          <div className="cit-stat-lbl">Critical Events</div>
        </div>
      </div>

      {/* Latest alerts strip */}
      {alerts.length > 0 && (
        <div className="cit-section">
          <h3 className="cit-section-title">📢 Latest Alerts</h3>
          <div className="cit-alert-list">
            {alerts.slice(0, 4).map((a, i) => (
              <div className="cit-alert-item" key={i}>
                <span className="cit-alert-pulse" />
                <div>
                  <div className="cit-alert-msg">{a.message}</div>
                  <div className="cit-alert-time">
                    {a.broadcastTime ? new Date(a.broadcastTime).toLocaleString() : "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency actions */}
      <div className="cit-section">
        <h3 className="cit-section-title">⚡ Quick Actions</h3>
        <div className="cit-action-grid">
          <button className="cit-action-card danger" onClick={onHelpClick}>
            <span>🆘</span>
            <strong>Request Help</strong>
            <small>Send an emergency rescue request</small>
          </button>
          <a className="cit-action-card" href="tel:112">
            <span>📞</span>
            <strong>Call 112</strong>
            <small>National emergency number</small>
          </a>
          <a className="cit-action-card" href="tel:101">
            <span>🚒</span>
            <strong>Fire — 101</strong>
            <small>Fire & rescue services</small>
          </a>
          <a className="cit-action-card" href="tel:108">
            <span>🚑</span>
            <strong>Ambulance — 108</strong>
            <small>Medical emergency</small>
          </a>
        </div>
      </div>
    </div>
  );
}

function AlertsTab({ alerts }) {
  return (
    <div className="cit-tab-content">
      <div className="cit-tab-header">
        <h2>My Alerts</h2>
        <span className="cit-count-badge">{alerts.length}</span>
      </div>
      {alerts.length === 0 ? (
        <div className="cit-empty">
          <span>◉</span>
          <p>No alerts issued for your area yet.</p>
        </div>
      ) : (
        <div className="cit-cards-list">
          {alerts.map((a, i) => (
            <div className="cit-card" key={i}>
              <div className="cit-card-top">
                <span className="cit-card-dot pulse-red" />
                <span className="cit-card-title">{a.message}</span>
              </div>
              <div className="cit-card-meta">
                <span>📅 {a.broadcastTime ? new Date(a.broadcastTime).toLocaleString() : "—"}</span>
                {a.disaster && <span>⚡ {a.disaster.type || "Disaster"}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DisastersTab({ disasters }) {
  return (
    <div className="cit-tab-content">
      <div className="cit-tab-header">
        <h2>Nearby Disasters</h2>
        <span className="cit-count-badge">{disasters.length}</span>
      </div>
      {disasters.length === 0 ? (
        <div className="cit-empty">
          <span>⚡</span>
          <p>No disasters detected near your location.</p>
        </div>
      ) : (
        <div className="cit-cards-list">
          {disasters.map((d, i) => {
            const sev = SEVERITY_MAP[d.severity] || { label: d.severity || "Unknown", cls: "sev-low" };
            return (
              <div className={`cit-card cit-disaster-card ${sev.cls}`} key={i}>
                <div className="cit-card-top">
                  <span className={`cit-sev-pill ${sev.cls}`}>{sev.label}</span>
                  <span className="cit-card-title">{d.name || d.type || "Disaster"}</span>
                </div>
                <div className="cit-card-body">
                  {d.location && <p>📍 {d.location}</p>}
                  {d.type     && <p>🏷 Type: {d.type}</p>}
                  {d.reportedAt && <p>📅 Reported: {new Date(d.reportedAt).toLocaleString()}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HelpTab({ onOpen, onCancel }) {
  return (
    <div className="cit-tab-content">
      <div className="cit-tab-header">
        <h2>Request Help</h2>
      </div>
      <div className="cit-help-hero">
        <div className="cit-help-icon">🆘</div>
        <h3>Are you in danger?</h3>
        <p>Send a rescue request and our responders will be notified immediately with your location.</p>
        <button className="cit-btn-danger cit-btn-lg" onClick={onOpen}>
          Request Emergency Help
        </button>
      </div>
      <div className="cit-help-tips">
        <h4>While waiting for help:</h4>
        <ul>
          <li>✔ Stay calm and stay in a safe location</li>
          <li>✔ Keep your phone charged if possible</li>
          <li>✔ Signal rescuers with a flashlight or bright cloth</li>
          <li>✔ Do not move if you are injured</li>
          <li>✔ Stay away from flood water or fire</li>
        </ul>
      </div>
    </div>
  );
}

function LocationTab({ onOpen, useGPS, gpsLoading }) {
  return (
    <div className="cit-tab-content">
      <div className="cit-tab-header">
        <h2>My Location</h2>
      </div>
      <div className="cit-location-card">
        <div className="cit-location-icon">📍</div>
        <h3>Keep Your Location Updated</h3>
        <p>
          Your location helps us send you relevant disaster alerts and ensures rescue teams can find you quickly in an emergency.
        </p>
        <div className="cit-location-actions">
          <button className="cit-btn-primary" onClick={useGPS} disabled={gpsLoading}>
            {gpsLoading ? "Detecting…" : "📍 Use GPS"}
          </button>
          <button className="cit-btn-secondary" onClick={onOpen}>
            ✏️ Enter Manually
          </button>
        </div>
      </div>
      <div className="cit-info-box">
        <h4>🔒 Privacy Note</h4>
        <p>Your location is only used to deliver disaster alerts and emergency assistance. It is never shared with third parties.</p>
      </div>
    </div>
  );
}
