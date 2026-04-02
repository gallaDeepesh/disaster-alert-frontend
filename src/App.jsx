import { Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard"
import CitizenDashboard from "./pages/CitizenDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResponderDashboard from "./pages/ResponderDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/admin/dashboard" element={<AdminDashboard/>}/>

      <Route path="/responder/test" element={<ResponderDashboard/>}/>

      <Route path="/citizen/test" element={<CitizenDashboard/>}/>
    </Routes>
  );
}

export default App;