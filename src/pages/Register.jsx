import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./CSS/Auth.css";
import apiService from "../services/api.js"; // adjust path as needed

const ROLES = ["RESPONDER", "OBSERVER"];

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Number", test: (p) => /\d/.test(p) },
];

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CITIZEN",
    phone: "",
    zone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 2-step form
  const navigate = useNavigate();

  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(form.password)).length;
  const strengthLabel = ["", "WEAK", "FAIR", "STRONG", "SECURE"][passwordStrength];
  const strengthColor = ["", "red", "amber", "blue", "green"][passwordStrength];

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (passwordStrength < 3) {
      setError("Password is too weak.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await apiService.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone,
        zone: form.zone,
      });
      setSuccess(true);
      setTimeout(() => navigate("/"), 2800);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleNext(e) {
    e.preventDefault();
    if (!form.name || !form.email) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setStep(2);
  }

  if (success) {
    return (
      <div className="auth-root">
        <div className="auth-grid-bg" />
        <div className="auth-scanline" />
        <div className="success-screen">
          <div className="success-icon">⬡</div>
          <div className="success-title">ACCESS GRANTED</div>
          <div className="success-sub">
            Your operator credentials have been created.<br />
            Redirecting to login…
          </div>
          <div className="success-bar">
            <div className="success-bar-fill" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-root">
      <div className="auth-grid-bg" />
      <div className="auth-scanline" />

      {/* Top ticker */}
      <div className="auth-ticker">
        <span className="ticker-label">◉ NEXUS</span>
        <div className="ticker-track">
          <span className="ticker-msg">OPERATOR REGISTRATION PORTAL — AUTHORIZED USE ONLY</span>
        </div>
        <span className="ticker-time">
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      <div className="auth-layout">
        {/* Left panel */}
        <div className="auth-left">
          <div className="auth-left-inner">
            <div className="brand-block">
              <div className="brand-hex">⬡</div>
              <div className="brand-name">NEXUS</div>
              <div className="brand-tagline">Emergency Command System</div>
            </div>

            <div className="reg-info-list">
              {[
                { icon: "⚡", title: "Rapid Response", desc: "Get dispatched to active disaster zones instantly." },
                { icon: "◉", title: "Real-Time Alerts", desc: "Receive broadcast alerts the moment they're issued." },
                { icon: "◎", title: "Task Assignment", desc: "Accept and complete rescue tasks from command." },
                { icon: "◷", title: "Team Coordination", desc: "Operate in sync with field responders nationwide." },
              ].map((item) => (
                <div className="reg-info-item" key={item.title}>
                  <span className="reg-info-icon">{item.icon}</span>
                  <div>
                    <div className="reg-info-title">{item.title}</div>
                    <div className="reg-info-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="auth-left-footer">
              <span className="status-beacon" />
              REGISTRATION CHANNEL SECURE
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="auth-right">
          <div className="auth-card auth-card-tall">
            <div className="auth-card-header">
              <div className="auth-card-tag">OPERATOR ENROLLMENT</div>
              <h1 className="auth-card-title">Request Access</h1>
              <p className="auth-card-sub">
                Create your field operator credentials for the NEXUS command network.
              </p>
            </div>

            {/* Step indicator */}
            <div className="step-indicator">
              <div className={`step-dot ${step >= 1 ? "active" : ""}`}>
                <span>01</span>
                <div className="step-label">Identity</div>
              </div>
              <div className={`step-line ${step >= 2 ? "filled" : ""}`} />
              <div className={`step-dot ${step >= 2 ? "active" : ""}`}>
                <span>02</span>
                <div className="step-label">Credentials</div>
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <span>⚠</span> {error}
              </div>
            )}

            {step === 1 && (
              <form className="auth-form" onSubmit={handleNext}>
                <div className="field-group">
                  <label className="field-label">Full Name</label>
                  <div className="field-wrap">
                    <span className="field-icon">◈</span>
                    <input
                      type="text"
                      className="field-input"
                      placeholder="Operator full name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Email Address</label>
                  <div className="field-wrap">
                    <span className="field-icon">◉</span>
                    <input
                      type="email"
                      className="field-input"
                      placeholder="emailAdders"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label">Phone (optional)</label>
                    <div className="field-wrap">
                      <span className="field-icon">◷</span>
                      <input
                        type="tel"
                        className="field-input"
                        placeholder="+91 00000 00000"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Assigned Zone (optional)</label>
                    <div className="field-wrap">
                      <span className="field-icon">◎</span>
                      <input
                        type="text"
                        className="field-input"
                        placeholder="e.g. Zone-4B"
                        value={form.zone}
                        onChange={(e) => setForm({ ...form, zone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Operator Role</label>
                  <div className="role-selector">
                    {ROLES.map((r) => (
                      <button
                        type="button"
                        key={r}
                        className={`role-btn ${form.role === r ? "selected" : ""}`}
                        onClick={() => setForm({ ...form, role: r })}
                      >
                        <span className="role-icon">
                          {r === "RESPONDER" ? "◎" : "◈"}
                        </span>
                        <span className="role-name">{r}</span>
                        <span className="role-desc">
                          {r === "RESPONDER"
                            ? "Field rescue operator"
                            : "Monitor & report only"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="auth-submit">
                  CONTINUE → CREDENTIALS
                </button>
              </form>
            )}

            {step === 2 && (
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="field-group">
                  <label className="field-label">Password</label>
                  <div className="field-wrap">
                    <span className="field-icon">◉</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="field-input"
                      placeholder="Create strong password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
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

                  {/* Strength meter */}
                  {form.password && (
                    <div className="strength-wrap">
                      <div className="strength-bars">
                        {[1, 2, 3, 4].map((n) => (
                          <div
                            key={n}
                            className={`strength-bar ${
                              n <= passwordStrength ? `str-${strengthColor}` : ""
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`strength-label str-text-${strengthColor}`}>
                        {strengthLabel}
                      </span>
                    </div>
                  )}

                  <div className="password-rules">
                    {PASSWORD_RULES.map((r) => (
                      <span
                        key={r.label}
                        className={`rule ${r.test(form.password) ? "pass" : ""}`}
                      >
                        {r.test(form.password) ? "✓" : "○"} {r.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Confirm Password</label>
                  <div className="field-wrap">
                    <span className="field-icon">◉</span>
                    <input
                      type="password"
                      className={`field-input ${
                        form.confirmPassword &&
                        form.confirmPassword !== form.password
                          ? "field-mismatch"
                          : ""
                      }`}
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm({ ...form, confirmPassword: e.target.value })
                      }
                      required
                    />
                    {form.confirmPassword && (
                      <span className="field-check">
                        {form.confirmPassword === form.password ? "✓" : "✕"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="auth-back-btn"
                    onClick={() => setStep(1)}
                  >
                    ← BACK
                  </button>
                  <button
                    type="submit"
                    className={`auth-submit flex-1 ${loading ? "loading" : ""}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="btn-spinner" /> ENROLLING…
                      </>
                    ) : (
                      <>⬡ ENROLL OPERATOR</>
                    )}
                  </button>
                </div>
              </form>
            )}

            <div className="auth-divider">
              <span>ALREADY ENROLLED?</span>
            </div>

            <Link to="/" className="auth-switch-btn">
              ◈ Return to Command Login
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
