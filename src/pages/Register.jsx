import axios from "axios";
import { useState } from "react";
import "./Register.css"; // Import the external CSS

function Register() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    latitude: "",
    longitude: "",
    role: "CITIZEN",
  });

  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      setUser({
        ...user,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      alert("Location captured!");
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(user.email)) {
      alert("Please enter a valid email address!");
      return;
    }

    if (user.password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/auth/register", user);
      alert("User registered successfully");
    } catch (error) {
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input name="name" onChange={handleChange} placeholder="Username" required />
          <input name="email" onChange={handleChange} placeholder="Email" required />
          <input name="password" onChange={handleChange} type="password" placeholder="Password" required />
          
          {/* Added the missing Confirm Password input */}
          <input 
            type="password" 
            placeholder="Confirm Password" 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />

          <div className="location-section">
            <button type="button" className="location-btn" onClick={getLocation}>
              Get My Location
            </button>
            {user.latitude && (
              <p className="location-status">📍 Location Captured</p>
            )}
          </div>

          <select name="role" onChange={handleChange} value={user.role}>
            <option value="CITIZEN">Citizen</option>
            <option value="RESPONDER">Responder</option>
          </select>

          <button type="submit" className="submit-btn">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register;