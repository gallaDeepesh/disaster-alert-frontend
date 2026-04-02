import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./CSS/Auth.css";
import apiService from "../services/api.js";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Geolocation should be inside an effect or triggered by an action
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          await apiService.put("/api/citizen/location", { latitude, longitude });
        } catch (err) {
          console.error("Location update failed", err);
        }
      });
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiService.post("/api/auth/login", form);
      sessionStorage.setItem("token", res.data.token || res.data.accessToken || "");
      const role = res.data.role || res.data.user?.role || "";
      
      if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "RESPONDER") navigate("/responder/test");
      else if (role === "CITIZEN") navigate("/citizen/test");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Emergency Services Portal</h1>
          <p>Please log in to access your dashboard.</p>
        </div>

        {error && <div className="auth-alert error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="e.g. name@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button 
                type="button" 
                className="toggle-pwd"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
          <div className="guidelines">
            <span>Tip: Ensure your GPS is enabled for faster response times.</span>
          </div>
        </div>
      </div>
    </div>
  );
}