const puppeteer = require('puppeteer');

async function scrapeCaseDetails(caseUrl, userAgent) {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);
    // Navigating to case URL to fetch case details
    await page.goto(caseUrl, { waitUntil: 'networkidle0' });
    console.log('Navigated to case URL:', caseUrl);

    const caseDetails = await page.evaluate(() => {
        const nameElement = document.querySelector('div#oscn-content div.CountsContainer:first-of-type td.countpartyname > nobr');

        // Assuming each count and verdict are in the same row, we select the rows
        const countRows = document.querySelectorAll('div#oscn-content div.CountsContainer');

        let firstName = '';
        let lastName = '';
        if (nameElement) {
            [lastName, firstName] = nameElement.textContent.trim().split(', '); // Assuming format "Last, First"
        }

        // Map each row to an object containing the count description and verdict
        const countsWithVerdicts = Array.from(countRows).map(row => {
            const countDescription = row.querySelector('table.Counts > tbody tr td.CountDescription').textContent.trim();
            const verdictElement = row.querySelector('table.Disposition > tbody tr td.countdisposition font strong');
            const verdict = verdictElement ? verdictElement.textContent.trim() : '';
            return {
                countDescription: countDescription,
                verdict: verdict
            };
        });

        return {
            fullName: `${firstName} ${lastName}`.trim(),
            counts: countsWithVerdicts,
            docketUrl: window.location.href,
        };
    });

    console.log('Extracted case details:', caseDetails);
    await browser.close();
    return caseDetails;
}

module.exports = scrapeCaseDetails;