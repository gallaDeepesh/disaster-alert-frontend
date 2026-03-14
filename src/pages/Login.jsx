import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Attempting login with:", email);

    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        email: email,
        password: password
      });
      console.log("Success:", response.data);
      alert("Login Successful!");
    } catch (error) {
      console.error("Login Error:", error);
      alert("Login Failed. Check console for details.");
    }
  };

  return (
    <div style={{textAlign: "center", marginTop: "100px", fontFamily: "sans-serif" }}>
      <div style={{ backgroundColor: "white",border: "1px solid #ccc", display: "inline-block", padding: "20px", borderRadius: "8px" }}>
        <h2 style={{color:"black"}}>Disaster Management Login </h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: "8px", width: "200px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: "8px", width: "200px" }}
            />
          </div>
          <button type="submit" style={{ padding: "10px 20px", cursor: "pointer", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px" }}>
            Login
          </button>
          <div style={{ marginTop: "20px" }}>
            <p>New user? 
              <Link to="/register" style={{ marginLeft: "5px", color: "blue", textDecoration: "underline" }}>
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;