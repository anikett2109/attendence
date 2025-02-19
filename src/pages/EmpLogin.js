import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EmployeeLogin = () => {
    const [formData, setFormData] = useState({ emid: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post("http://localhost:5000/employee-login", formData);
            alert(response.data.message);
            localStorage.setItem("employeeToken", response.data.token); // Store JWT token
            navigate("/employee-dash"); // Redirect to dashboard
        } catch (err) {
            setError(err.response?.data?.message || "Login failed! Invalid credentials.");
        }
    };

    return (
        <div style={{
            maxWidth: "400px",
            margin: "50px auto",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
            textAlign: "center"
        }}>
            <h2 style={{ marginBottom: "20px", color: "#333" }}>Employee Login</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
                <input
                    type="text"
                    name="emid"
                    placeholder="Employee ID"
                    value={formData.emid}
                    onChange={handleChange}
                    required
                    style={{ padding: "10px", margin: "8px 0", borderRadius: "4px", border: "1px solid #ccc" }}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ padding: "10px", margin: "8px 0", borderRadius: "4px", border: "1px solid #ccc" }}
                />
                <button
                    type="submit"
                    style={{
                        backgroundColor: "#007bff",
                        color: "white",
                        padding: "10px",
                        borderRadius: "4px",
                        border: "none",
                        cursor: "pointer",
                        marginTop: "10px"
                    }}
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default EmployeeLogin;
