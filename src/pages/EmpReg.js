import React, { useState, useEffect } from "react";
import axios from "axios";

const EmployeeRegister = () => {
    const [formData, setFormData] = useState({
        name: "",
        emid: "",
        password: "",
        officeId: ""
    });
    const [officeIds, setOfficeIds] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        axios.get("http://localhost:5000/get-office-ids")
            .then((res) => setOfficeIds(res.data.map(admin => admin.officeId)))
            .catch(() => setError("Failed to fetch Office IDs"));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post("http://localhost:5000/register-employee", formData);
            alert(response.data.message);
            setFormData({ name: "", emid: "", password: "", officeId: "" });
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed!");
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
            <h2 style={{ marginBottom: "20px", color: "#333" }}>Employee Registration</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{ padding: "10px", margin: "8px 0", borderRadius: "4px", border: "1px solid #ccc" }}
                />
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
                <select
                    name="officeId"
                    value={formData.officeId}
                    onChange={handleChange}
                    required
                    style={{ padding: "10px", margin: "8px 0", borderRadius: "4px", border: "1px solid #ccc", background: "#fff" }}
                >
                    <option value="">Select Office ID</option>
                    {officeIds.map((id) => (
                        <option key={id} value={id}>{id}</option>
                    ))}
                </select>

                <button
                    type="submit"
                    style={{
                        backgroundColor: "#28a745",
                        color: "white",
                        padding: "10px",
                        borderRadius: "4px",
                        border: "none",
                        cursor: "pointer",
                        marginTop: "10px"
                    }}
                >
                    Register
                </button>
            </form>
        </div>
    );
};

export default EmployeeRegister;
