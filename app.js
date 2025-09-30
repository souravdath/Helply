const express = require('express');
const path = require('path');
const pool = require('./config/db'); // Your database connection
const bcrypt = require('bcrypt');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const app = express();
const saltRounds = 10; // For password hashing

// --- Template Engine Setup ---
// Set EJS as the view engine and specify the views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Middleware Setup ---
// Serve static files (CSS, images, client-side JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Middleware to parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Middleware
app.use(session({
    store: new FileStore(), // Stores sessions in a local file, good for development
    secret: 'a secret key to sign the cookie', // CHANGE THIS to a long, random string in production
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if you are using HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // Cookie expires in 1 day
    }
}));


// --- Page Rendering Routes ---

// Route for the main landing page
app.get('/', (req, res) => {
    res.render('index', { user: req.session.userId ? req.session : null });
});
app.get('/index', (req, res) => {
    es.render('index', { user: req.session.userId ? req.session : null });
});

// Route for the user profile page
app.get('/profile', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/signin');
    }
    const query = 'SELECT Name, email, phone, location FROM user WHERE User_ID = ?';
    pool.query(query, [req.session.userId], (error, results) => {
        if (error || results.length === 0) {
            return res.status(500).send("Error fetching user data.");
        }
        res.render('profile', { user: results[0] });
    });
});

// Routes for Sign In and Sign Up
app.get('/signin', (req, res) => {
    res.render('signIn');
});

app.get('/signup', (req, res) => {
  res.render('signUp');
});

// Other page rendering routes
app.get('/findwork', (req, res) => res.render('findwork'));
app.get('/hire', (req, res) => res.render('hire'));
app.get('/job-details', (req, res) => res.render('job-details'));
app.get('/job-request/:jobId', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/signin');
    }

    const jobId = req.params.jobId;
    const userId = req.session.userId;

    const jobQuery = 'SELECT Job_ID, Title FROM job WHERE Job_ID = ?';
    const userQuery = 'SELECT Name, email FROM user WHERE User_ID = ?';

    pool.query(jobQuery, [jobId], (err, jobResults) => {
        if (err || jobResults.length === 0) {
            return res.status(404).send('Job not found.');
        }
        pool.query(userQuery, [userId], (err, userResults) => {
            if (err || userResults.length === 0) {
                return res.status(500).send('Could not fetch user details.');
            }
            res.render('job-request', {
                job: jobResults[0],
                user: userResults[0]
            });
        });
    });
});
app.get('/worker_dashboard', (req, res) => res.render('worker_dashboard'));
app.get('/employer_dash', (req, res) => res.render('employer_dash'));


// --- Authentication API Endpoints ---

// Handle Sign Up form submission
app.post('/signup', async (req, res) => {
    const { name, email, username, location, password } = req.body;

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const query = 'INSERT INTO user (Name, email, username, location, password) VALUES (?, ?, ?, ?, ?)';

        pool.query(query, [name, email, username, location, hashedPassword], (error, results) => {
            if (error) {
                console.error("Database insert error:", error);
                // Handle specific errors like duplicate email/username
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).send('Username or email already exists.');
                }
                return res.status(500).send('Server error during user creation.');
            }
            // On successful creation, redirect to the sign-in page
            res.redirect('/signin');
        });
    } catch (error) {
        console.error("Hashing error:", error);
        res.status(500).send('Server error.');
    }
});

// Handle Sign In form submission
app.post('/signin', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT User_ID, password FROM user WHERE username = ?';

    pool.query(query, [username], async (error, results) => {
        if (error || results.length === 0) {
            return res.status(401).send("Invalid username or password.");
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // Passwords match, create a session
            req.session.userId = user.User_ID;
            req.session.username = username;
            // Redirect to a dashboard or profile page
            res.redirect('/profile');
        } else {
            // Passwords don't match
            res.status(401).send("Invalid username or password.");
        }
    });
});


// --- General API Endpoints ---

// API to get all jobs from the database
app.get('/api/jobs', (req, res) => {
    const query = 'SELECT `Job_ID` as id, `Title` as title, `Description` as description, `Location` as location, `Salary` as pay, `Type` as category FROM `job` WHERE `JobStatus` = "Open"';
    pool.query(query, (error, results) => {
        if (error) {
            console.error("Database query error:", error);
            return res.status(500).json({ error: 'Failed to fetch jobs.' });
        }
        res.json(results);
    });
});

// API to post a new job to the database
app.post('/api/jobs', (req, res) => {
    // Check if user is logged in
    if (!req.session.userId) {
        return res.status(403).json({ error: 'You must be logged in to post a job.' });
    }

    const { title, category, location, pay, description, contactInfo } = req.body;
    const userId = req.session.userId; // Get user ID from the session

    const query = 'INSERT INTO job (Title, Description, Location, Salary, Type, ContactInfo, User_id_FK) VALUES (?, ?, ?, ?, ?, ?, ?)';

    pool.query(query, [title, description, location, pay, category, contactInfo, userId], (error, results) => {
        if (error) {
            console.error("Database insert error:", error);
            return res.status(500).json({ error: 'Failed to post job.' });
        }
        res.status(201).json({ message: 'Job posted successfully!', jobId: results.insertId });
    });
});

// API to handle a new job application
app.post('/api/applications', (req, res) => {
    if (!req.session.userId) {
        return res.status(403).json({ error: 'You must be logged in to apply for a job.' });
    }

    const { jobId, coverLetter } = req.body;
    const userId = req.session.userId;

    const query = 'INSERT INTO application (Cover_letter, user_id_FK, job_id_FK) VALUES (?, ?, ?)';

    pool.query(query, [coverLetter, userId, jobId], (error, results) => {
        if (error) {
            console.error("Database insert error:", error);
            return res.status(500).json({ error: 'Failed to submit application.' });
        }
        res.status(201).json({ message: 'Application submitted successfully!' });
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Logout error.");
        }
        res.redirect('/');
    });
});



// --- Server Initialization ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

