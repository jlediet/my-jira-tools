import express from 'express';
const axios = require('axios');
const agileservices = require('./services/jira-agile');
const jiraservices = require('./services/jira-rest');
const agilehelpers = require('./helpers/jira-agile');
const v1Routes = require('./routes/api/v1/routes');
const asyncMiddleware = require('./middleware/async');

// Set up the express app
const app = express();

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

v1Routes(app);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});