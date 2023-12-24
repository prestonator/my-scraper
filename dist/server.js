"use strict";
const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require('fs');
const bodyParser = require("body-parser");
const searchRoutes = require("./routes/search");
require("dotenv").config();
const app = express();
const { PORT, NODE_SESSION_SECRET } = process.env;
app.use(session({
    secret: NODE_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views/pages"));
app.get("/", (req, res) => {
    const counties = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/counties.json'), 'utf8'));
    res.render("index", { counties });
});
app.use(searchRoutes);
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
