import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./CSS/Auth.css";
import apiService from "../services/api.js"; // adjust path as needed

const ALERTS = [
  "SEISMIC ACTIVITY DETECTED — ZONE 4B",
  "FLOOD WARNING ISSUED — COASTAL REGIONS",
  "EVACUATION ORDER ACTIVE — SECTOR 7",
  "RESCUE TEAMS DEPLOYED — 12 UNITS",
  "COMMUNICATION BLACKOUT — AREA 3C",
];

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tickerIndex, setTickerIndex] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => {
      setTickerIndex((i) => (i + 1) % ALERTS.length);
    }, 3200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  // adding latitude,longitude
  navigator.geolocation.getCurrentPosition(async (position) => {

  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  await apiService.put("/api/citizen/location", {
    latitude,
    longitude
  });

});

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiService.post("/api/auth/login", form);
      // store token however your app does it
      localStorage.setItem("token", res.data.token || res.data.accessToken || "");
      const role = res.data.role || res.data.user?.role || "";
      if (role === "ADMIN") navigate("/admin/dashboard");
      
      else if(role === "RESPONDER") navigate("/responder/test");
      
      else if(role === "CITIZEN") navigate("/citizen/test");

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        "Invalid credentials. Access denied."
      );
    } finally {
      setLoading(false);
    }
    
  }

  return (
    <div className="auth-root">
      {/* Animated grid background */}
      <div className="auth-grid-bg" />
      <div className="auth-scanline" />

      {/* Top ticker bar */}
      <div className="auth-ticker">
        <span className="ticker-label">◉ LIVE</span>
        <div className="ticker-track">
          <span className="ticker-msg" key={tickerIndex}>
            {ALERTS[tickerIndex]}
          </span>
        </div>
        <span className="ticker-time">
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {/* Main split layout */}
      <div className="auth-layout">
        {/* Left panel */}
        <div className="auth-left">
          <div className="auth-left-inner">
            <div className={`brand-block ${glitch ? "glitch" : ""}`}>
              <div className="brand-hex">⬡</div>
              <div className="brand-name">NEXUS</div>
              <div className="brand-tagline">Emergency Command System</div>
            </div>

            <div className="auth-stats-grid">
              {[
                { label: "Active Incidents", value: "14", color: "red" },
                { label: "Deployed Units", value: "87", color: "amber" },
                { label: "Zones Covered", value: "32", color: "blue" },
                { label: "Alerts Issued", value: "206", color: "green" },
              ].map((s) => (
                <div className={`mini-stat mini-${s.color}`} key={s.label}>
                  <div className="mini-val">{s.value}</div>
                  <div className="mini-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="auth-left-footer">
              <span className="status-beacon" />
              SYSTEM OPERATIONAL · ALL NODES ACTIVE
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-card-header">
              <div className="auth-card-tag">SECURE ACCESS</div>
              <h1 className="auth-card-title">Command Login</h1>
              <p className="auth-card-sub">
                Authorized personnel only. All access is monitored and logged.
              </p>
            </div>

            {error && (
              <div className="auth-error">
                <span>⚠</span> {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label">Email Address</label>
                <div className="field-wrap">
                  <span className="field-icon">◈</span>
                  <input
                    type="email"
                    className="field-input"
                    placeholder=" emailAddress"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Password</label>
                <div className="field-wrap">
                  <span className="field-icon">◉</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="field-input"
                    placeholder="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="field-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? "◔" : "◕"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={`auth-submit ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner" /> AUTHENTICATING…
                  </>
                ) : (
                  <>⬡ ACCESS COMMAND CENTER</>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>NEW OPERATOR?</span>
            </div>

            <Link to="/register" className="auth-switch-btn">
              ◎ Request System Access
            </Link>

            <div className="auth-card-footer">
              <span>NEXUS v2.4.1</span>
              <span>·</span>
              <span>ENCRYPTED CHANNEL</span>
              <span>·</span>
              <span>256-BIT TLS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
