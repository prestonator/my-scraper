/**
 * Initializes an Express server, configures middleware,
 * sets up routes and starts listening on the specified port.
 */
const express = require("express");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const searchRoutes = require("./routes/search");

// Initialize express app
const app = express();
const port = 5670;

// Configure session middleware
app.use(
	session({
		secret: "edison",
		resave: false,
		saveUninitialized: true,
	})
);

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

// Serve static files from the 'public' directory
//app.use(express.static('public'));

// Set the view engine to ejs
app.set("view engine", "ejs");

// Set the directory where the views will be loaded from
app.set("views", path.join(__dirname, "views/pages"));

// Define a route for the root of the app
app.get("/", (req, res) => {
	// Render the index.ejs file
	res.render("index");
});

// Use the search route
app.use(searchRoutes);

// Start the server
app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});
