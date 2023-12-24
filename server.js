/**
 * Initializes an Express server, configures middleware,
 * sets up routes and starts listening on the specified port.
 */
const express = require("express");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const searchRoutes = require("./routes/search");
require("dotenv").config();

// Initialize express app
const app = express();

// Load environment variables from .env file
const { PORT, NODE_SESSION_SECRET } = process.env;

// Configure session middleware
app.use(
	session({
		secret: NODE_SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
	})
);

// Parse incoming request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set view engine and views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views/pages"));

// Define root route
app.get("/", (req, res) => {
	res.render("index");
});

// Use search routes
app.use(searchRoutes);

// Start server
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
