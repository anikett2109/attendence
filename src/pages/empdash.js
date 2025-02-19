import React, { useEffect, useState } from "react";
import axios from "axios";

const EmployeeDashboard = () => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [isCheckedIn, setIsCheckedIn] = useState(false);

    // Fetch attendance history
    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const res = await axios.get("http://localhost:5000/attendance/history", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setAttendanceRecords(res.data);

            // Check if the last record has no checkOutTime (meaning the employee is checked in)
            if (res.data.length > 0 && !res.data[0].checkOutTime) {
                setIsCheckedIn(true);
            }
        } catch (error) {
            console.error("Error fetching attendance history", error);
        }
    };

    // Handle Check-In
    const handleCheckIn = async () => {
        try {
            const token = localStorage.getItem("token");
            console.log("Token being sent:", token); // Debugging step
    
            if (!token) {
                alert("You are not authenticated! Please log in again.");
                return;
            }
    
            await axios.post("http://localhost:5000/attendance/checkin", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            alert("Check-in successful!");
            setIsCheckedIn(true);
            fetchAttendance(); // Refresh records
        } catch (error) {
            console.error("Check-in error:", error.response?.data || error);
            alert(error.response?.data?.error || "Check-in failed");
        }
    };
    

    // Handle Check-Out
    const handleCheckOut = async () => {
        try {
            await axios.post("http://localhost:5000/attendance/checkout", {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            alert("Check-out successful!");
            setIsCheckedIn(false);
            fetchAttendance(); // Refresh records
        } catch (error) {
            alert(error.response?.data?.error || "Check-out failed");
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "auto", textAlign: "center", fontFamily: "Arial" }}>
            <h2>Employee Dashboard</h2>

            {/* Check-In/Check-Out Button */}
            {isCheckedIn ? (
                <button onClick={handleCheckOut} style={{ padding: "10px 20px", margin: "10px", backgroundColor: "red", color: "white", border: "none", cursor: "pointer" }}>
                    Check Out
                </button>
            ) : (
                <button onClick={handleCheckIn} style={{ padding: "10px 20px", margin: "10px", backgroundColor: "green", color: "white", border: "none", cursor: "pointer" }}>
                    Check In
                </button>
            )}

            {/* Attendance History Table */}
            <h3>Attendance History</h3>
            <table border="1" cellPadding="5" cellSpacing="0" style={{ width: "100%", marginTop: "20px" }}>
                <thead>
                    <tr>
                        <th>Check-In Time</th>
                        <th>Check-Out Time</th>
                        <th>Duration (mins)</th>
                    </tr>
                </thead>
                <tbody>
                    {attendanceRecords.length > 0 ? (
                        attendanceRecords.map((record, index) => (
                            <tr key={index}>
                                <td>{new Date(record.checkInTime).toLocaleString()}</td>
                                <td>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : "N/A"}</td>
                                <td>{record.duration > 0 ? record.duration : "N/A"}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3">No attendance records found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeeDashboard;
