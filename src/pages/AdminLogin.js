import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/login", formData);
      if (response.data.success) {
        navigate("/admindash");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Admin Login</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.button}>Login</button>
        </form>
      </div>
    </div>
  );
};

// Inline CSS styles
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
    width: "350px",
  },
  title: {
    marginBottom: "20px",
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginBottom: "10px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    marginBottom: "15px",
    textAlign: "left",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  button: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default AdminLogin;
