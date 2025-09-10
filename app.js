const express = require('express');
const path = require('path');
const pool = require('./config/db'); // Your database connection

const app = express();

// --- Template Engine & Middleware ---
// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, images, client-side JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Middleware to parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- Page Rendering Routes ---

// Route for the main landing page
app.get('/', (req, res) => {
    res.render('index');
});
app.get('/index', (req, res) => {
    res.render('index');
});

// Route for the user profile page
app.get('/profile', (req, res) => {
    // In a real app, you would fetch user data from the database based on their session
    const dummyUser = {
        Name: "Jessica Doe",
        email: "jessica.doe@example.com",
        phone: "+91 98765 43210"
    };
    res.render('profile', { user: dummyUser });
});

// Routes for Sign In and Sign Up
app.get('/signin', (req, res) => {
    res.render('signIn');
});

app.get('/signup', (req, res) => {
  res.render('signUp');
});

// Route for the 'Find Work' page
app.get('/findwork', (req, res) => {
    res.render('findwork');
});

// Route for the 'Hire' (Post a Job) page
app.get('/hire', (req, res) => {
    res.render('hire');
});

// Route for the job details page
app.get('/job-details', (req, res) => {
    // This would typically fetch a specific job by ID, e.g., /job-details/:id
    res.render('job-details');
});

// Route for the job application/request page
app.get('/job-request', (req, res) => {
    res.render('job-request');
});


// --- API Endpoints ---

// API to get all jobs from the database
app.get('/api/jobs', (req, res) => {
    const query = 'SELECT `Job_ID` as id, `Title` as title, `Description` as description, `Location` as location, `Salary` as pay, `Type` as category FROM `job`';
    pool.query(query, (error, results) => {
        if (error) {
            console.error("Database query error:", error);
            return res.status(500).json({ error: 'Failed to fetch jobs from the database.' });
        }
        res.json(results);
    });
});

// API to post a new job to the database
app.post('/api/jobs', (req, res) => {
    const { title, category, location, pay, description, contactInfo } = req.body;
    // Assuming a 'User_id_FK' is required. For now, we'll use a placeholder.
    const userId = 1; // In a real app, you'd get this from the logged-in user's session
    const query = 'INSERT INTO job (Title, Description, Location, Salary, Type, User_id_FK) VALUES (?, ?, ?, ?, ?, ?)';

    pool.query(query, [title, description, location, pay, category, userId], (error, results) => {
        if (error) {
            console.error("Database insert error:", error);
            return res.status(500).json({ error: 'Failed to post job to the database.' });
        }
        res.status(201).json({ message: 'Job posted successfully!', jobId: results.insertId });
    });
});

// Placeholder for handling Sign Up form
app.post('/signup', (req, res) => {
  console.log('Sign up data received:', req.body);
  // Add database logic here to insert a new user
  res.redirect('/signin'); // Redirect to sign-in page after successful sign-up
});


// --- Server Initialization ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
