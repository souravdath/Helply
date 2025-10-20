// app.js

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs'); // Import the 'fs' module
const db = require('./config/db'); // Your promise-enabled database connection
const bcrypt = require('bcrypt');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const app = express();
const saltRounds = 10; // For password hashing

// --- Create sessions directory if it doesn't exist ---
const sessionsDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir);
}

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
    store: new FileStore({ path: sessionsDir }), // Specify the path to the sessions directory
    secret: 'a secret key to sign the cookie', 
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // Cookie expires in 1 day
    }
}));


// --- Page Rendering Routes ---

app.get('/', (req, res) => {
    res.render('index', { user: req.session.userId ? req.session : null });
});

app.get('/index', (req, res) => {
    res.render('index', { user: req.session.userId ? req.session : null });
});

app.get('/profile', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/signin');
    }
    try {
        const query = 'SELECT Name, email, phone, location, Skills FROM user WHERE User_ID = ?';
        const [results] = await db.query(query, [req.session.userId]);
        
        if (results.length === 0) {
            return res.status(404).send("User not found.");
        }
        res.render('profile', { user: results[0] });
    } catch (error) {
        console.error("Error fetching user data:", error);
        return res.status(500).send("Error fetching user data.");
    }
});

app.get('/signin', (req, res) => {
    res.render('signIn');
});

app.get('/signup', (req, res) => {
    res.render('signUp');
});

app.get('/hire', (req, res) => res.render('hire'));

app.get('/job-details', async(req, res) => {
    // Fetch only 'Open' jobs to display on the worker's job board
    const [jobs] = await db.query('SELECT Job_ID, Title, Description, Location, Salary, Type, ScheduledDate, ScheduledTime FROM job WHERE JobStatus = "Open"');
    res.render('job-details', { jobs });
});

app.get('/job-request/:jobId', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/signin');
    }

    const jobId = req.params.jobId;
    const userId = req.session.userId;

    const jobQuery = 'SELECT Job_ID, Title FROM job WHERE Job_ID = ?';
    const userQuery = 'SELECT Name, email FROM user WHERE User_ID = ?';
    
    try {
        const [jobResults] = await db.query(jobQuery, [jobId]);
        if (jobResults.length === 0) {
            return res.status(404).send('Job not found.');
        }

        const [userResults] = await db.query(userQuery, [userId]);
        if (userResults.length === 0) {
            return res.status(500).send('Could not fetch user details.');
        }

        res.render('job-request', {
            job: jobResults[0],
            user: userResults[0]
        });
    } catch (err) {
        console.error("Database query error:", err);
        return res.status(500).send('Server error fetching job request details.');
    }
});

app.get('/employer_dash', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/signin');
    }

    const employerId = req.session.userId;

    try {
        const statsQuery = 'SELECT COUNT(*) AS jobsPosted FROM job WHERE User_id_FK = ?';
        const [statsResult] = await db.query(statsQuery, [employerId]);
        const stats = statsResult[0];

        const jobsQuery = 'SELECT * FROM job WHERE User_id_FK = ? ORDER BY Job_ID DESC LIMIT 5';
        const [jobsResult] = await db.query(jobsQuery, [employerId]);

        res.render('employer_dash', {
            user: { id: req.session.userId, username: req.session.username },
            stats,
            jobs: jobsResult
        });
    } catch (err) {
        console.error("Error fetching employer dashboard data:", err);
        return res.status(500).send("Error fetching dashboard data.");
    }
});

app.delete('/job/:id', async (req, res) => {
    const jobId = req.params.id;
    const query = "DELETE FROM job WHERE Job_ID = ?";

    try {
        const [result] = await db.query(query, [jobId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }
        console.log(`✅ Job ${jobId} deleted successfully`);
        res.json({ success: true });
    } catch (err) {
        console.error("Error deleting job:", err);
        return res.status(500).json({ success: false, message: "Error deleting job" });
    }
});

app.get('/worker_dashboard', async (req, res) => { 
    if (!req.session.userId) {
        return res.redirect('/signin');
    }

    try {
        const query = 'SELECT Name, username FROM user WHERE User_ID = ?';
        const [results] = await db.query(query, [req.session.userId]);
        
        if (results.length === 0) {
            return res.status(404).send("Worker not found.");
        }
        res.render('worker_dashboard', { user: results[0] });
    } catch (error) {
        console.error("Error fetching worker data:", error);
        return res.status(500).send("Error fetching worker data for dashboard.");
    }
});


// --- Authentication API Endpoints ---

app.post('/signup', async (req, res) => {
    const { name, email, username, location, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const query = 'INSERT INTO user (Name, email, username, location, password) VALUES (?, ?, ?, ?, ?)';
        await db.query(query, [name, email, username, location, hashedPassword]);
        res.redirect('/signin');
    } catch (error) {
        console.error("Database insert error:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).send('Username or email already exists.');
        }
        return res.status(500).send('Server error during user creation.');
    }
});

app.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT User_ID, password FROM user WHERE username = ?';

    try {
        const [results] = await db.query(query, [username]);

        if (results.length === 0) {
            return res.status(401).send("Invalid username or password.");
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            req.session.userId = user.User_ID;
            req.session.username = username;
            res.redirect('/profile');
        } else {
            res.status(401).send("Invalid username or password.");
        }
    } catch (error) {
        console.error("Sign-in error:", error);
        res.status(500).send('Server error during sign-in.');
    }
});


// --- General API Endpoints ---

app.get('/api/jobs', async (req, res) => {
    try {
        const query = 'SELECT `Job_ID` as id, `Title` as title, `Description` as description, `Location` as location, `Salary` as pay, `Type` as category FROM `job` WHERE `JobStatus` = "Open"';
        const [results] = await db.query(query);
        res.json(results);
    } catch (error) {
        console.error("Database query error:", error);
        return res.status(500).json({ error: 'Failed to fetch jobs.' });
    }
});

app.get('/api/employer/applications', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).json({ error: 'You must be logged in to view applications.' });
    }
    const employerId = req.session.userId;
    const query = `
        SELECT a.Application_ID AS id, a.Status AS status, j.Title AS jobTitle,
                u.Name AS workerName, u.phone AS workerPhone, a.Cover_letter AS coverLetter
        FROM application a
        JOIN job j ON a.job_id_FK = j.Job_ID
        JOIN user u ON a.user_id_FK = u.User_ID
        WHERE j.User_id_FK = ?
        ORDER BY a.applied_date DESC`;
    try {
        const [results] = await db.query(query, [employerId]);
        res.json(results);
    } catch (error) {
        console.error("Database query error:", error);
        return res.status(500).json({ error: 'Failed to fetch applications.' });
    }
});

app.get('/api/worker/applications', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).json({ error: 'You must be logged in to view your applications.' });
    }
    const workerId = req.session.userId;
    const query = `
        SELECT
            a.Application_ID AS id,
            a.Status AS status,
            j.Title AS jobTitle,
            j.Location AS jobLocation,
            j.Salary AS jobSalary,
            e.Name AS employerName,
            e.phone AS employerPhone,
            a.Cover_letter AS coverLetter
        FROM application a
        JOIN job j ON a.job_id_FK = j.Job_ID
        JOIN user e ON j.User_id_FK = e.User_ID 
        WHERE a.user_id_FK = ?
        ORDER BY a.applied_date DESC`;
    try {
        const [results] = await db.query(query, [workerId]);
        res.json(results);
    } catch (error) {
        console.error("Database query error:", error);
        return res.status(500).json({ error: 'Failed to fetch worker applications.' });
    }
});

app.put('/api/applications/:id/status', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).json({ error: 'You must be logged in.' });
    }

    const appId = req.params.id;
    const { status } = req.body;

    try {
        const updateQuery = 'UPDATE application SET Status = ? WHERE Application_ID = ?';
        const [updateResults] = await db.query(updateQuery, [status, appId]);
        
        if (updateResults.affectedRows === 0) {
            return res.status(404).json({ error: 'Application not found or update failed.' });
        }

        if (status === 'rejected') {
            return res.status(200).json({ message: 'Application rejected.', status: 'rejected' });
        }

        if (status === 'accepted') {
            const contactQuery = `
                SELECT j.ContactInfo AS employerContact, u.Name AS employerName
                FROM application a
                JOIN job j ON a.job_id_FK = j.Job_ID
                JOIN user u ON j.User_id_FK = u.User_ID
                WHERE a.Application_ID = ?`;

            const [contactResults] = await db.query(contactQuery, [appId]);
            
            return res.status(200).json({ 
                message: 'Application accepted successfully! Worker will be notified.', 
                status: 'accepted',
                contact: contactResults.length > 0 ? contactResults[0] : null
            });
        }
    } catch (error) {
        console.error("Database operation error:", error);
        return res.status(500).json({ error: 'Failed to process application status change.' });
    }
});

app.post('/api/profile', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).json({ error: 'You must be logged in to update your profile.' });
    }
    const { name, phone, location, skills } = req.body;
    const userId = req.session.userId;
    try {
        const query = 'UPDATE user SET Name = ?, phone = ?, location = ?, Skills = ? WHERE User_ID = ?';
        await db.query(query, [name, phone, location, skills, userId]);
        const selectQuery = 'SELECT Name, email, phone, location, Skills FROM user WHERE User_ID = ?';
        const [userResult] = await db.query(selectQuery, [userId]);
        
        if (userResult.length === 0) {
            return res.status(500).json({ error: 'Could not retrieve updated profile.' });
        }
        res.status(200).json({ message: 'Profile updated successfully!', user: userResult[0] });
    } catch (error) {
        console.error("Database update error:", error);
        return res.status(500).json({ error: 'Failed to update profile.' });
    }
});

// THIS IS THE CORRECTED ROUTE
app.post('/api/jobs', async (req, res) => {
    try {
        const { title, description, location, salary, category, contactInfo, jobDate, jobTime, requirements } = req.body; 

        // Find the corresponding Service_ID from the category name.
        const [categoryResult] = await db.query('SELECT Service_ID FROM service_category WHERE Name = ?', [category]);
        
        if (categoryResult.length === 0) {
            return res.status(400).json({ error: 'Invalid service category provided.' });
        }
        const serviceIdFk = categoryResult[0].Service_ID;

        // Use the 'salary' variable in the query.
        const [result] = await db.query(
            `INSERT INTO job 
            (Title, Description, Location, Salary, Type, Requirements, ContactInfo, JobStatus, User_id_FK, Service_id_FK, ScheduledDate, ScheduledTime) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                description,
                location,
                salary, 
                category,
                requirements,
                contactInfo,
                'Open',
                req.session.userId,
                serviceIdFk, 
                jobDate,
                jobTime
            ]
        );

        res.json({ success: true, jobId: result.insertId });
    } catch (err) {
        console.error("Error inserting job:", err);
        res.status(500).json({ error: 'Failed to save job' });
    }
});

app.post('/api/applications', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).json({ error: 'You must be logged in to apply for a job.' });
    }
    const { jobId, coverLetter } = req.body;
    const userId = req.session.userId;
    try {
        const query = 'INSERT INTO application (Cover_letter, user_id_FK, job_id_FK) VALUES (?, ?, ?)';
        await db.query(query, [coverLetter, userId, jobId]);
        res.status(201).json({ message: 'Application submitted successfully!' });
    } catch (error) {
        console.error("Database insert error:", error);
        return res.status(500).json({ error: 'Failed to submit application.' });
    }
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