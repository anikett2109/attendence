import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDash = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({ empId: "", name: "", password: "" });
  const [editingId, setEditingId] = useState(null);
  const [officeId, setOfficeId] = useState(null);

  // ✅ Fetch officeId linked to empId
  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/office", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        console.log("Office ID:", res.data.officeId);
        setOfficeId(res.data.officeId);
      })
      .catch((err) => console.error("Error fetching officeId", err));
}, []);


  // ✅ Fetch employees by officeId once it's retrieved
  useEffect(() => {
    if (!officeId) return;

    axios
      .get(`http://localhost:5000/employees/${officeId}`)
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error("Error fetching employees", err));
  }, [officeId]);

  // ✅ Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Add or update employee
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/employees/${editingId}`, formData);
      } else {
        await axios.post("http://localhost:5000/employees", { ...formData, officeId });
      }
      setFormData({ empId: "", name: "", password: "" });
      setEditingId(null);
      window.location.reload();
    } catch (error) {
      console.error("Error saving employee", error);
    }
  };

  // ✅ Delete employee
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      await axios.delete(`http://localhost:5000/employees/${id}`);
      window.location.reload();
    }
  };

  return (
    <div style={styles.container}>
      <h2>Admin Dashboard</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="text" name="empId" placeholder="Employee ID" value={formData.empId} onChange={handleChange} required />
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <button type="submit">{editingId ? "Update" : "Add"} Employee</button>
      </form>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Emp ID</th>
            <th>Name</th>
            <th>Password</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp._id}>
              <td>{emp.empId}</td>
              <td>{emp.name}</td>
              <td>{emp.password}</td>
              <td>
                <button onClick={() => setEditingId(emp._id) & setFormData(emp)}>Edit</button>
                <button onClick={() => handleDelete(emp._id)} style={styles.deleteBtn}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ✅ Styles
const styles = {
  container: { padding: "20px", textAlign: "center" },
  form: { display: "flex", gap: "10px", marginBottom: "20px", justifyContent: "center" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "20px" },
  deleteBtn: { backgroundColor: "red", color: "white", border: "none", padding: "5px" }
};

export default AdminDash;
