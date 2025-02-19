import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./pages/AdminRegister";
import AdminLogin from "./pages/AdminLogin";
import AdminDash from "./pages/admindash";
import EmployeeRegister from "./pages/EmpReg";
import EmployeeLogin from "./pages/EmpLogin";
import EmpDash from "./pages/empdash";


const HomePage = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Employee Attendance System</h1>
      <div style={styles.buttonContainer}>
        <Link to="/employee-login" style={styles.button}>Employee Login</Link>
        <Link to="/register-employee" style={styles.button}>Employee Register</Link>
        <Link to="/admin-login" style={styles.button}>Admin Login</Link>
        <Link to="/register" style={styles.button}>Admin Register</Link>
        
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admindash" element={<AdminDash />} />
        <Route path="/register-employee" element={<EmployeeRegister />} />
        <Route path="/employee-login" element={<EmployeeLogin />} />
        <Route path="/employee-dash" element={<EmpDash />} />
      </Routes>
    </Router>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f4f4f4",
    textAlign: "center",
  },
  title: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "30px",
  },
  buttonContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  },
  button: {
    padding: "12px 24px",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#007bff",
    textDecoration: "none",
    borderRadius: "8px",
    textAlign: "center",
    transition: "0.3s",
  },
};

export default App;
