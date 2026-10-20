const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend build files without modifying them
app.use(express.static(path.join(__dirname, 'dist', 'Frontend')));

// MongoDB Atlas Connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.log('MongoDB Connection Error:', err));

// Employee Schema & Model
const employeeSchema = new mongoose.Schema({
    name: String,
    location: String,
    position: String,
    salary: Number
});

const EmployeeData = mongoose.models.employeedata || mongoose.model('employeedata', employeeSchema);

// ================= API ROUTES ================= //

// 1. GET: Retrieve all employees
app.get('/api/employeelist', async (req, res) => {
    try {
        const employees = await EmployeeData.find();
        res.status(200).send(employees);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving employees', error });
    }
});

// 2. GET: Retrieve a single employee by ID
app.get('/api/employeelist/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving employee', error: error.message });
    }
});

// 3. POST: Add a new employee
app.post('/api/employeelist', async (req, res) => {
    try {
        const newEmployee = new EmployeeData(req.body);
        const savedEmployee = await newEmployee.save();
        res.status(200).send(savedEmployee);
    } catch (error) {
        res.status(500).send({ message: 'Error adding employee', error });
    }
});

// 4. PUT: Update an existing employee by ID
app.put('/api/employeelist', async (req, res) => {
    try {
        const id = req.body._id || req.body.id;
        const updatedEmployee = await EmployeeData.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );
        res.status(200).send(updatedEmployee);
    } catch (error) {
        res.status(500).send({ message: 'Error updating employee', error });
    }
});

// 5. DELETE: Delete a single employee by ID
app.delete('/api/employeelist/:id', async (req, res) => {
    try {
        const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
        if (!deletedEmployee) {
            return res.status(404).json({ message: 'Employee not found for deletion' });
        }
        res.status(200).json({ message: 'Employee deleted successfully', deletedEmployee });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting employee', error: error.message });
    }
});

// Catch-all route to serve Angular SPA frontend
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'Frontend', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});