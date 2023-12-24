"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
function scrapeCaseDetails(page, caseUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield page.goto(caseUrl, { waitUntil: "networkidle0" });
            const caseDetails = yield page.evaluate(() => {
                const nameElement = document.querySelector("div#oscn-content div.CountsContainer:first-of-type td.countpartyname > nobr");
                const countRows = document.querySelectorAll("div#oscn-content div.CountsContainer");
                let firstName = "";
                let lastName = "";
                if (nameElement) {
                    [lastName, firstName] = nameElement.textContent.trim().split(", ");
                }
                const countsWithVerdicts = Array.from(countRows).map((row) => {
                    const countDescriptionElement = row.querySelector("table.Counts > tbody tr td.CountDescription");
                    const countDescription = countDescriptionElement
                        ? countDescriptionElement.textContent.trim()
                        : "Description not found";
                    const verdictElement = row.querySelector("table.Disposition > tbody tr td.countdisposition font strong");
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
        catch (error) {
            console.error("Error scraping case details:", error.stack);
            throw error;
        }
    });
}
function scrapeDockets(searchUrl, userAgent) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = yield browser.newPage();
        yield page.setUserAgent(userAgent);
        yield page.goto(searchUrl, { waitUntil: "networkidle0" });
        const content = yield page.content();
        const $ = cheerio.load(content);
        const caseNumberSelector = "div#oscn-content table.caseCourtTable tbody tr.resultTableRow > td:first-child > a";
        const docketLinkSelector = "div#oscn-content table.caseCourtTable tbody tr.resultTableRow > td.result_shortstyle > a";
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
            const caseDetails = yield scrapeCaseDetails(page, cases[caseNumber].docketPageLink);
            cases[caseNumber] = Object.assign(Object.assign({}, cases[caseNumber]), caseDetails);
        }
        yield browser.close();
        return Object.values(cases);
    });
}
module.exports = { scrapeDockets };
