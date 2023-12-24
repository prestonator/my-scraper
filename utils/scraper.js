/**
 * Scrapes court docket information from OSCN using Puppeteer and Cheerio.
 *
 * @param {string} searchUrl - The OSCN search URL to scrape.
 * @param {string} userAgent - The user agent string for the headless browser.
 * @returns {Promise<Object[]>} Promise resolving to array of case objects.
 */
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const scrapeCaseDetails = require("./caseDetailsScraper");

// This utility function handles scraping of OSCN using Puppeteer and Cheerio
async function scrapeDockets(searchUrl, userAgent) {
	console.log("Launching browser");
	const browser = await puppeteer.launch({
		headless: "new",
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});
	console.log("Browser launched Successfully!");
	let page;
	let exception = null; // Initialize exception to null
	try {
		page = await browser.newPage();
		await page.setUserAgent(userAgent);
		console.log("User agent is set!");

		// Navigate to the URL constructed from the search form
		await page.goto(searchUrl, { waitUntil: "networkidle0" });
		console.log("Page navigated, content is loading");

		// Get the page content and load it into Cheerio for parsing
		const content = await page.content();
		console.log("Content loaded, starting extraction now");

		const $ = cheerio.load(content);

		// Define selectors for 'Case Number' and 'Docket Page Link'
		// These selectors must match the actual page structure and may need adjustments
		const caseNumberSelector =
			"div#oscn-content table.caseCourtTable tbody tr.resultTableRow > td:first-child > a";
		const docketLinkSelector =
			"div#oscn-content table.caseCourtTable tbody tr.resultTableRow > td.result_shortstyle > a";

		// Stores unique case entries
		const cases = {};

		// Extract 'Case Number' and corresponding 'Docket Page Link'
		$(caseNumberSelector).each((index, element) => {
			const caseNumber = $(element).text().trim();
			const docketPageLink = $(element).attr("href");
			if (caseNumber && docketPageLink && !cases[caseNumber]) {
				cases[caseNumber] = {
					caseNumber: caseNumber,
					docketPageLink: `http://www.oscn.net/dockets/${docketPageLink}`,
				};
				console.log(`Case extracted:  ${caseNumber}`);
			}
		});

		// Updating case objects with additional details
		for (let caseNumber in cases) {
			const caseData = await scrapeCaseDetails(
				cases[caseNumber].docketPageLink,
				userAgent
			);
			console.log("Scraping case details:", caseData);
			cases[caseNumber] = {
				...cases[caseNumber],
				...caseData,
			};
		}

		// Return array of case objects with no duplicates
		console.log("Extraction complete, closing browser now");
		return Object.values(cases);
	} catch (error) {
		// Adjust exception to error
		console.error("Error during scraping:", error); // Log the correct error variable
		exception = error; // Assign error to exception for final block reference
		throw error;
	} finally {
		if (!exception && browser) {
			await browser.close();
			console.log("Browser closed now");
		}
	}
}

module.exports = { scrapeDockets };
