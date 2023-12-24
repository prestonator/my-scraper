// utils/scraper.js
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
/**
 * Scrapes details about a case from a case page.
 *
 * @param {Page} page - Puppeteer page object
 * @param {string} caseUrl - URL of the case page
 * @returns {Object} Object containing name, counts, docketUrl
 */
async function scrapeCaseDetails(page, caseUrl) {
    // Navigating to case URL to fetch case details
    await page.goto(caseUrl, { waitUntil: "networkidle0" });

    const caseDetails = await page.evaluate(() => {
        const nameElement = document.querySelector(
            "div#oscn-content div.CountsContainer:first-of-type td.countpartyname > nobr"
        );
        const countRows = document.querySelectorAll(
            "div#oscn-content div.CountsContainer"
        );

        let firstName = "";
        let lastName = "";
        if (nameElement) {
            [lastName, firstName] = nameElement.textContent.trim().split(", "); // Assuming format "Last, First"
        }

        const countsWithVerdicts = Array.from(countRows).map((row) => {
            const countDescriptionElement = row.querySelector(
                "table.Counts > tbody tr td.CountDescription"
            );
            const countDescription = countDescriptionElement
                ? countDescriptionElement.textContent.trim()
                : "Description not found";
            const verdictElement = row.querySelector(
                "table.Disposition > tbody tr td.countdisposition font strong"
            );
            const verdict = verdictElement ? verdictElement.textContent.trim() : "";
            return {
                countDescription: countDescription,
                verdict: verdict,
            };
        });

        return {
            fullName: `${firstName} ${lastName}`.trim(),
            counts: countsWithVerdicts,
            docketUrl: window.location.href,
        };
    });

    return caseDetails;
}

/**
 * Scrapes court dockets from a search URL using Puppeteer and Cheerio.
 *
 * @param {string} searchUrl - The URL of the docket search page
 * @param {string} userAgent - The user agent string to use for Puppeteer
 * @returns {Object[]} An array of scraped docket objects
 */
async function scrapeDockets(searchUrl, userAgent) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);

    await page.goto(searchUrl, { waitUntil: "networkidle0" });
    const content = await page.content();
    const $ = cheerio.load(content);
    const caseNumberSelector =
        "div#oscn-content table.caseCourtTable tbody tr.resultTableRow > td:first-child > a";
    const docketLinkSelector =
        "div#oscn-content table.caseCourtTable tbody tr.resultTableRow > td.result_shortstyle > a";

    const cases = {};

    $(caseNumberSelector).each((index, element) => {
        const caseNumber = $(element).text().trim();
        const docketPageLink = $(element).attr("href");
        if (caseNumber && docketPageLink && !cases[caseNumber]) {
            cases[caseNumber] = {
                caseNumber: caseNumber,
                docketPageLink: `http://www.oscn.net/dockets/${docketPageLink}`,
            };
        }
    });

    for (let caseNumber in cases) {
        const caseDetails = await scrapeCaseDetails(
            page,
            cases[caseNumber].docketPageLink
        );
        cases[caseNumber] = {
            ...cases[caseNumber],
            ...caseDetails,
        };
    }

    await browser.close();
    return Object.values(cases);
}

module.exports = { scrapeDockets };
