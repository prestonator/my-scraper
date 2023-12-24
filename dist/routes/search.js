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
const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const { scrapeDockets } = require("../utils/scraper");
const session = require("express-session");
const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "../.env"),
});
const session_secret = process.env.NODE_SESSION_SECRET;
const user_agent = process.env.OSCN_USER_AGENT;
router.use(session({
    secret: session_secret,
    resave: false,
    saveUninitialized: true,
}));
router.post("/search", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Received search request:", req.body);
    const { db, FiledDateL, ClosedDateH } = req.body;
    const formattedFiledDateL = dayjs(FiledDateL).format("MM/DD/YYYY");
    const formattedClosedDateH = dayjs(ClosedDateH).format("MM/DD/YYYY");
    const searchUrl = `http://www.oscn.net/dockets/Results.aspx?db=${db}&partytype=10009&FiledDateL=${encodeURIComponent(formattedFiledDateL)}&ClosedDateH=${encodeURIComponent(formattedClosedDateH)}&dcct=32`;
    console.log("Constructed search URL:", formattedClosedDateH);
    try {
        console.log("Initiating scraping process for URL:", searchUrl);
        const cases = yield scrapeDockets(searchUrl, user_agent);
        console.log("Scraping complete, cases found:", cases.length);
        req.session.cases = cases;
        res.redirect("/results");
    }
    catch (error) {
        console.error("Search route error:", error.stack);
        res.status(500).send({ message: error.message });
    }
}));
router.get("/results", (req, res) => {
    if (req.session.cases) {
        res.render("results", { cases: req.session.cases });
        req.session.cases = null;
    }
    else {
        res.redirect("/");
    }
});
module.exports = router;
