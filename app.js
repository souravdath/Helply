
const express = require('express');
const path = require('path'); // Node.js built-in module for working with file paths

// Create an Express application instance
const app = express();

// --- EJS Configuration ---
// Set EJS as the view engine for rendering dynamic HTML
app.set('view engine', 'ejs');
// Specify the directory where your EJS template files are located
// path.join(__dirname, 'views') ensures it works correctly across different operating systems
app.set('views', path.join(__dirname, 'views'));

// --- Static Files Configuration ---
// Serve static files (like CSS, JavaScript, images) from the 'public' directory
// When a browser requests a file like '/style.css', Express will look for it in 'helply/public/style.css'
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes ---

// Define a route for the home page or root URL
// When a user navigates to '/', they will see a simple welcome message
app.get('/', (req, res) => {
    res.send('Welcome to Helply! Navigate to /profile to see the profile page.');
});

// Define the route for the user profile page
// When a user navigates to '/profile', the 'profile.ejs' template will be rendered
app.get('/profile', (req, res) => {
    // --- Dummy Data for Frontend Development ---
    // This 'dummyUser' object simulates data that would typically come from a database
    // In the future, your backend (Node.js + MySQL) will fetch real user data here
    const dummyUser = {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        role: "Volunteer"
    };

    // Render the 'profile.ejs' template and pass the 'dummyUser' data to it
    // The EJS template can then access this data using variables like <%= user.name %>
    res.render('profile', { user: dummyUser });
});

// --- Sign In Route ---
app.get('/signin', (req, res) => {
    res.render('signIn'); // This will render views/signIn.ejs
});

// --- Server Start ---

// Define the port on which the server will listen
// It will use the port specified in environment variables (e.g., for deployment) or default to 3000


// Start the server and listen for incoming requests on the specified port
app.listen(3000, () => {
    console.log("port 3000 is listenning");
});
