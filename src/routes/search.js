/**
 * Search router module.
 *
 * Defines Express router with routes for searching court dockets
 * and rendering results.
 *
 * Uses session middleware to store search results.
 * Calls scraper utility to retrieve docket data from OSCN site.
 * Formats dates and constructs search URL before scraping.
 * Renders results page with docket data from session.
 */
const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const { scrapeDockets } = require("../utils/scraper");
const session = require("express-session");
const path = require("path");
require("dotenv").config({
	path: path.resolve(__dirname, "../.env"),
});

// Load environment variables from .env file
const session_secret = process.env.NODE_SESSION_SECRET;
const user_agent = process.env.OSCN_USER_AGENT;

// Configure session middleware
router.use(
	session({
		secret: session_secret,
		resave: false,
		saveUninitialized: true,
	})
);

router.post("/search", async (req, res) => {
	console.log("Received search request:", req.body);

	const { db, FiledDateL, ClosedDateH } = req.body;
	const formattedFiledDateL = dayjs(FiledDateL).format("MM/DD/YYYY");
	const formattedClosedDateH = dayjs(ClosedDateH).format("MM/DD/YYYY");
	const searchUrl = `http://www.oscn.net/dockets/Results.aspx?db=${db}&partytype=10009&FiledDateL=${encodeURIComponent(
		formattedFiledDateL
	)}&ClosedDateH=${encodeURIComponent(formattedClosedDateH)}&dcct=32`;

	console.log("Constructed search URL:", formattedClosedDateH);

	try {
		console.log("Initiating scraping process for URL:", searchUrl);
		const cases = await scrapeDockets(searchUrl, user_agent);
		console.log("Scraping complete, cases found:", cases.length);
		// Inside the try block, after scraping is complete
		req.session.cases = cases; // Store the cases in the session
		res.redirect("/results"); // Redirect to the results page
	} catch (error) {
		console.error("Search route error:", error.stack);
		res.status(500).send({ message: error.message });
	}
});

// Add a new route for '/results'
router.get("/results", (req, res) => {
	// Check if there are cases stored in the session
	if (req.session.cases) {
		// Render the results page with the cases data
		res.render("results", { cases: req.session.cases });
		// Clear the cases from the session
		req.session.cases = null;
	} else {
		// If there are no cases, redirect to the home page
		res.redirect("/");
	}
});

module.exports = router;
