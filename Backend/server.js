const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs"); // For password hashing
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Admin Schema & Model
const AdminSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  officeId: { type: String, unique: true, required: true },
});

const Admin = mongoose.model("Admin", AdminSchema);

const EmployeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    emid: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    officeId: { type: String, required: true }
});
const Employee = mongoose.model("Employee", EmployeeSchema);

const attendanceSchema = new mongoose.Schema({
    emid: { type: String, required: true }, // Unique Employee ID
    checkInTime: { type: Date, required: true }, // Timestamp of check-in
    checkOutTime: { type: Date }, // Timestamp of check-out (nullable until checkout)
    duration: { type: Number, default: 0 } // Duration in minutes (calculated at checkout)
}, { timestamps: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
// module.exports = Attendance;

app.get("/get-office-ids", async (req, res) => {
    try {
        const admins = await Admin.find({}, "officeId");
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: "Error fetching office IDs" });
    }
});

app.post("/register-employee", async (req, res) => {
    try {
        const { name, emid, password, officeId } = req.body;

        // Check if officeId exists in Admin DB
        const adminExists = await Admin.findOne({ officeId });
        if (!adminExists) {
            return res.status(400).json({ message: "Invalid Office ID!" });
        }

        // Check if emid is unique
        const existingEmployee = await Employee.findOne({ emid });
        if (existingEmployee) {
            return res.status(400).json({ message: "Employee ID already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newEmployee = new Employee({ name, emid, password: hashedPassword, officeId });
        await newEmployee.save();
        
        res.status(201).json({ message: "Employee Registered Successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error registering employee", error });
    }
});

app.post("/employee-login", async (req, res) => {
    try {
        const { emid, password } = req.body;

        if (!emid || !password) {
            return res.status(400).json({ message: "Employee ID and password are required!" });
        }

        const employee = await Employee.findOne({ emid });
        if (!employee) {
            return res.status(401).json({ message: "Invalid Employee ID" });
        }

        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Password!" });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: employee._id, emid: employee.emid }, process.env.JWT_SECRET, { expiresIn: "24h" });

        res.status(200).json({ success: true, message: "Login successful!", token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error. Please try again." });
    }
});

// 🔹 API Route to Register Admin
app.post("/register", async (req, res) => {
  try {
    const { email, name, password, officeId } = req.body;
    console.log("Received request to register:", { email, name, password, officeId });

    // Check if email or office ID already exists
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { officeId }] });
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin);
      return res.status(400).json({ message: "Email or Office ID already exists!" });
    }

    // Hash the password before saving

    const newAdmin = new Admin({ email, name, password, officeId });
    await newAdmin.save();
    console.log("New admin added:", newAdmin);

    res.status(201).json({ message: "Admin Registered Successfully!" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Error registering admin", error });
  }
});

// 🔹 API Route to Admin Login
app.post("/login", async (req, res) => {
    try {
      
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required!" });
        }

        const admin = await Admin.findOne({ email });

        if (!admin || admin.password !== password) {
            return res.status(401).json({ message: "Invalid email or password!" });
        }

        const token = jwt.sign({ id: admin._id, emid: admin.emid }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.status(200).json({ success: true, message: "Login successful!", token });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error. Please try again." });
    }
});

// 🔹 Middleware to Verify Token

const verifyToken = (req, res, next) => {
  try {
    // Extract token from the "Authorization" header
    const authHeader = req.headers["authorization"];
    
    if (!authHeader) {
      return res.status(403).json({ message: "Access Denied: No Token Provided!" });
    }

    // Ensure token is in "Bearer <token>" format
    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res.status(400).json({ message: "Malformed Token!" });
    }

    const token = tokenParts[1];
    console.log("Received Token:", token);


    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("JWT Verification Error:", err.message);
        return res.status(401).json({ message: "Invalid or Expired Token" });
      }

      req.user = decoded; // Attach decoded payload to request
      next();
    });

  } catch (error) {
    console.error("Token Verification Failed:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = verifyToken;

app.post("/attendance/checkin", verifyToken, async (req, res) => {
    try {
        const employeeId = req.user.id;

        // Check if already checked in
        const existingCheckIn = await Attendance.findOne({ employeeId, checkOutTime: null });
        if (existingCheckIn) {
            return res.status(400).json({ error: "Already checked in" });
        }

        // Create new check-in record
        const attendance = new Attendance({
            employeeId,
            
            checkInTime: new Date()
        });

        await attendance.save();
        res.json({ message: "Checked in successfully", attendance });
    } catch (error) {
        res.status(500).json({ error: "Check-in failed" });
    }
});

app.post("/attendance/checkout", verifyToken, async (req, res) => {
    try {
        const employeeId = req.user.id;

        // Find latest check-in without a checkout
        const attendance = await Attendance.findOne({ employeeId, checkOutTime: null });

        if (!attendance) {
            return res.status(400).json({ error: "No active check-in found" });
        }

        // Set checkout time and calculate duration
        attendance.checkOutTime = new Date();
        attendance.duration = Math.round((attendance.checkOutTime - attendance.checkInTime) / (1000 * 60)); // Convert ms to minutes

        await attendance.save();
        res.json({ message: "Checked out successfully", attendance });
    } catch (error) {
        res.status(500).json({ error: "Check-out failed" });
    }
});

app.get("/attendance/history", verifyToken, async (req, res) => {
    try {
        const employeeId = req.user.id;
        const records = await Attendance.find({ employeeId }).sort({ checkInTime: -1 });
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch attendance history" });
    }
});


// app.get("/admin/office", async (req, res) => {
//     try {
//         // Assuming you are using JWT and have middleware to get user info
//         const adminId = req.user.id; // Get the logged-in admin's ID from JWT
//         const admin = await Admin.findById(adminId); // Fetch admin from DB

//         if (!admin) {
//             return res.status(404).json({ error: "Admin not found" });
//         }

//         res.json({ officeId: admin.officeId });
//     } catch (error) {
//         res.status(500).json({ error: "Failed to fetch officeId" });
//     }
// });


// // ✅ Get employees by officeId
// app.get("/employees/:officeId", async (req, res) => {
//     const { officeId } = req.params;
//     try {
//       const employees = await Employee.find({ officeId });
//       res.json(employees);
//     } catch (error) {
//       res.status(500).json({ error: "Failed to fetch employees" });
//     }
//   });
app.get("/admin/employees", verifyToken, async (req, res) => {
  try {
      const adminId = req.user.id; // Get logged-in admin's ID from JWT
      const admin = await Admin.findById(adminId);

      if (!admin) {
          return res.status(404).json({ error: "Admin not found" });
      }

      console.log("Fetching employees for officeId:", admin.officeId); // Debugging Log

      // Find employees with the same officeId as the admin
      const employees = await Employee.find({ officeId: admin.officeId });

      res.json(employees);
  } catch (error) {
      console.error("Error fetching employees:", error); // Log the error
      res.status(500).json({ error: "Failed to fetch employees" });
  }
});

  
  app.post("/employees", async (req, res) => {
    const { empId, name, password, officeId } = req.body;
    try {
      const newEmployee = new Employee({ empId, name, password, officeId });
      await newEmployee.save();
      res.json(newEmployee);
    } catch (error) {
      res.status(500).json({ error: "Failed to add employee" });
    }
  });
  
  app.put("/employees/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const updatedEmployee = await Employee.findByIdAndUpdate(id, req.body, { new: true });
      res.json(updatedEmployee);
    } catch (error) {
      res.status(500).json({ error: "Failed to update employee" });
    }
  });
  
  app.delete("/employees/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await Employee.findByIdAndDelete(id);
      res.json({ message: "Employee deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete employee" });
    }
  });
  

// module.exports = router;

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
