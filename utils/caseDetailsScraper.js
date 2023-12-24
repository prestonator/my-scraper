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
        const countsElements = document.querySelectorAll('div#oscn-content div.CountsContainer table.Counts > tbody tr td.CountDescription');
        const verdictElement = document.querySelector('div#oscn-content div.CountsContainer table.Disposition tbody tr td.countdisposition font strong');

        let firstName = '';
        let lastName = '';
        if (nameElement) {
            [lastName, firstName] = nameElement.textContent.trim().split(', '); // Assuming format "Last, First"
        }

        const counts = Array.from(countsElements).map(el => el.textContent.trim());
        const verdict = verdictElement ? verdictElement.textContent.trim() : '';

        return {
            fullName: `${firstName} ${lastName}`.trim(),
            counts: counts,
            verdict: verdict
        };
    });

    console.log('Extracted case details:', caseDetails);
    await browser.close();
    return caseDetails;
}

module.exports = scrapeCaseDetails;