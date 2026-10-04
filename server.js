const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Complaint = require("./Complaint");
const User = require("./User");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/fixit")
  .then(() => {
    console.log("MongoDB Connected Successfully!");
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error);
  });

app.get("/", (req, res) => {
  res.send("FixIt Backend is Running!");
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully!",
      user: user
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering user",
      error: error.message
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({
      email: email,
      password: password,
      role: role
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email, password or role"
      });
    }

    res.json({
      message: "Login successful!",
      user: user
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in",
      error: error.message
    });
  }
});

// Get Complaints
app.get("/complaints", async (req, res) => {
  try {
    const { studentEmail } = req.query;

    let complaints;

    if (studentEmail) {
      complaints = await Complaint.find({
        studentEmail: studentEmail
      }).sort({ createdAt: -1 });
    } else {
      complaints = await Complaint.find().sort({ createdAt: -1 });
    }

    res.json(complaints);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching complaints",
      error: error.message
    });
  }
});
app.post("/complaints", async (req, res) => {
  try {
    const complaint = new Complaint(req.body);

    await complaint.save();

    res.status(201).json({
      message: "Complaint submitted successfully!",
      complaint: complaint
    });
  } catch (error) {
    res.status(500).json({
      message: "Error submitting complaint",
      error: error.message
    });
  }
});

app.put("/complaints/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status
      },
      {
        new: true
      }
    );

    res.json({
      message: "Complaint status updated successfully!",
      complaint: complaint
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating complaint",
      error: error.message
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
