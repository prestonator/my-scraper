const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const { scrapeDockets } = require('../utils/scraper');

router.post('/search', async (req, res) => {
    console.log('Received search request:', req.body);

    const { db, FiledDateL, ClosedDateH, UserAgent } = req.body;
    const formattedFiledDateL = dayjs(FiledDateL).format('MM/DD/YYYY');
    const formattedClosedDateH = dayjs(ClosedDateH).format('MM/DD/YYYY');
    const searchUrl = `http://www.oscn.net/dockets/Results.aspx?db=${db}&partytype=10009&FiledDateL=${encodeURIComponent(formattedFiledDateL)}&ClosedDateH=${encodeURIComponent(formattedClosedDateH)}&dcct=32`;

    console.log('Constructed search URL:', formattedClosedDateH);

    try {
        console.log('Initiating scraping process for URL:', searchUrl);
        const cases = await scrapeDockets(searchUrl, UserAgent);
        console.log('Scraping complete, cases found:', cases.length);

        res.send({ data: cases });
    } catch (error) {
        console.error('Search route error:', error.stack);
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;