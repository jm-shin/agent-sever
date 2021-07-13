const request = require('request-promise-native');
const schedule = require('node-schedule');
const logger = require('./logger');
const tokenDB = require('../models/kakao_conf');
const option = require('../config/config').jwt_option;

const getTokenDaily = schedule.scheduleJob('0 0 8 * * ?',  async function () {
    try {
        let responseToken = await request(option);
        logger.info(`${JSON.stringify(responseToken)}`);
        responseToken = await JSON.parse(responseToken);

        if (responseToken.accesstoken) {
            logger.info(`accessToken detect`);
            await tokenDB.updateToken(responseToken);
            logger.info(`${new Date()} publish daily token`);
        } else {
            logger.info(`accessToken undetectable`);
        }
    } catch (err) {
        logger.info(err);
    }
});

module.exports.getTokenDaily = getTokenDaily;