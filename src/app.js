const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const logger = require ('./util/logger');
const scheduler = require('./scheduler');
const jwt = require('./util/jwt');
require('dotenv').config();

//mongo
const { MongoClient } = require('mongodb');
const mongoUrl = process.env.MONGO_URL;
const mongoOption = {appname: 'crm-api',  keepAlive: true, useUnifiedTopology: true};
const client = new MongoClient(mongoUrl, mongoOption);

const app = express();

logger.info('server init!!');
logger.info('================================================');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
morgan('dev');



module.exports = app;