const express = require('express');
const bodyParser = require('body-parser');
const searchRoutes = require('./routes/search');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5670;

// Error handling for uncaught exceptions
process.on('uncaughtException', error => {
    console.error('Uncaught Exception:', error);
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(searchRoutes);

app.use(function errorHandler(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.get('/', (req, res) => {
    res.status(200).sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
    console.log(`OSCN app listening at http://localhost:${port}`);
});