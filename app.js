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
// Fixed typo: 'es.render' changed to 'res.render'
app.get('/index', (req, res) => {
    res.render('index', { user: req.session.userId ? req.session : null });
});

// Route for the user profile page
app.get('/profile', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/signin');
    }
    // Updated query to include Skills
    const query = 'SELECT Name, email, phone, location, Skills FROM user WHERE User_ID = ?';
    pool.query(query, [req.session.userId], (error, results) => {
        if (error || results.length === 0) {
            console.error("Error fetching user data:", error);
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

// CORRECTED: Route for Employer Dashboard (Fetches user details)
app.get('/employer_dash', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/signin'); 
    }

    // Fetch user details required by the dashboard template
    const query = 'SELECT Name, username FROM user WHERE User_ID = ?';

    pool.query(query, [req.session.userId], (error, results) => {
        if (error || results.length === 0) {
            console.error("Error fetching employer data:", error);
            return res.status(500).send("Error fetching employer data for dashboard.");
        }
        
        res.render('employer_dash', { 
            user: results[0] // Pass the fetched user object
        });
    });
});

// CORRECTED: Route for Worker Dashboard (Fetches user details)
app.get('/worker_dashboard', (req, res) => { 
    if (!req.session.userId) {
        return res.redirect('/signin');
    }

    // Fetch user details required by the dashboard template
    const query = 'SELECT Name, username FROM user WHERE User_ID = ?';
    pool.query(query, [req.session.userId], (error, results) => {
        if (error || results.length === 0) {
            console.error("Error fetching worker data:", error);
            return res.status(500).send("Error fetching worker data for dashboard.");
        }
        res.render('worker_dashboard', { user: results[0] }); // Pass the fetched user object
    });
});


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

// API to get applications for jobs posted by the logged-in employer
app.get('/api/employer/applications', (req, res) => {
    // 1. Check if user is logged in
    if (!req.session.userId) {
        return res.status(403).json({ error: 'You must be logged in to view applications.' });
    }

    const employerId = req.session.userId;

    // 2. SQL Query: Joins three tables (application, job, user) and filters by employerId
    const query = `
        SELECT
            a.Application_ID AS id,
            a.Status AS status,
            j.Title AS jobTitle,
            u.Name AS workerName,
            u.phone AS workerPhone,
            a.Cover_letter AS coverLetter
        FROM application a
        JOIN job j ON a.job_id_FK = j.Job_ID
        JOIN user u ON a.user_id_FK = u.User_ID
        WHERE j.User_id_FK = ?
    `;

    // 3. Run the query
    pool.query(query, [employerId], (error, results) => {
        if (error) {
            console.error("Database query error:", error);
            return res.status(500).json({ error: 'Failed to fetch applications.' });
        }
        // 4. Send the result back as JSON
        res.json(results);
    });
});

// API to update the status of a specific application
app.put('/api/applications/:id/status', (req, res) => {
    // 1. Check if user is logged in (optional, but good practice for server-side checks)
    if (!req.session.userId) {
        return res.status(403).json({ error: 'You must be logged in.' });
    }

    const appId = req.params.id;
    const { status } = req.body; // status will be 'accepted' or 'rejected'

    // First Query: Update the status of the application
    const updateQuery = 'UPDATE application SET Status = ? WHERE Application_ID = ?';
    
    pool.query(updateQuery, [status, appId], (error, results) => {
        if (error || results.affectedRows === 0) {
            console.error("Database update error:", error);
            return res.status(500).json({ error: 'Failed to update application status.' });
        }

        // If updated to 'rejected', we are done.
        if (status === 'rejected') {
            return res.status(200).json({ message: 'Application rejected.', status: 'rejected' });
        }

        // --- Logic for ACCEPTED Status (Requires fetching employer contact info) ---
        if (status === 'accepted') {
            const contactQuery = `
                SELECT 
                    j.Title AS jobTitle,
                    j.ContactInfo AS employerContact, 
                    u.Name AS employerName
                FROM application a
                JOIN job j ON a.job_id_FK = j.Job_ID
                JOIN user u ON j.User_id_FK = u.User_ID
                WHERE a.Application_ID = ?
            `;

            pool.query(contactQuery, [appId], (err, contactResults) => {
                if (err || contactResults.length === 0) {
                    console.error("Database contact fetch error:", err);
                    // Still return success, but alert of missing data
                    return res.status(200).json({ 
                        message: 'Application accepted, but failed to fetch contact info.', 
                        status: 'accepted', 
                        contact: null 
                    });
                }

                // Success: Send back acceptance message and employer contact details
                res.status(200).json({ 
                    message: 'Application accepted successfully!', 
                    status: 'accepted',
                    contact: contactResults[0]
                });
            });
        }
    });
});


// API Endpoint to update user profile
app.post('/api/profile', (req, res) => {
    if (!req.session.userId) {
        return res.status(403).json({ error: 'You must be logged in to update your profile.' });
    }

    const { name, phone, location, skills } = req.body;
    const userId = req.session.userId;

    const query = 'UPDATE user SET Name = ?, phone = ?, location = ?, Skills = ? WHERE User_ID = ?';
    pool.query(query, [name, phone, location, skills, userId], (error, results) => {
        if (error) {
            console.error("Database update error:", error);
            return res.status(500).json({ error: 'Failed to update profile.' });
        }

        // After updating, fetch the updated user data to send back to the client
        const selectQuery = 'SELECT Name, email, phone, location, Skills FROM user WHERE User_ID = ?';
        pool.query(selectQuery, [userId], (err, userResult) => {
            if (err || userResult.length === 0) {
                return res.status(500).json({ error: 'Could not retrieve updated profile.' });
            }
            res.status(200).json({ message: 'Profile updated successfully!', user: userResult[0] });
        });
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
