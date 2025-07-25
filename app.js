const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Routes
const workerRoutes = require('./routes/workerRoutes');
app.use('/worker', workerRoutes);

// Home page
app.get('/', (req, res) => {
    res.send('Welcome to Helply!');
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
