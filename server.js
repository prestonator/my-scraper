const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const searchRoutes = require('./routes/search');

// Initialize express app
const app = express();
const port = 5670;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Set the directory where the views will be loaded from
app.set('views', path.join(__dirname, 'views/pages'));

// Define a route for the root of the app
app.get('/', (req, res) => {
    // Render the index.ejs file
    res.render('index');
});

// Use the search route
app.use(searchRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});