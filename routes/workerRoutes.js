// routes/workerRoutes.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Worker route working!');
});

module.exports = router;
