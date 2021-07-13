const { ToadScheduler, SimpleIntervalJob, Task  } = require('toad-scheduler');
const request = require('./sendMessage');
const logger = require('./logger');

const { findKaKaoInfo, deleteManyKakaoInfo } = require('../models/kakao_info');
const { insertManyKakaoLog } = require('../models/kakao_log');

const logName = '[schedule]';

const watchMongoDB = async (client) => {
    try {
        await client.connect();
        const kakao_info = client.db('CRM').collection('kakao_info');
        const kakao_log = client.db('CRM').collection('kakao_log');
        const scheduler = new ToadScheduler();
        const task = new Task('count mongodb', async () => {
            const count = await kakao_info.countDocuments({});
            if (count > 0) {
                await scheduler.stop();
                const result = await findKaKaoInfo(kakao_info);
                await checkMsgType(result);
                await insertManyKakaoLog(kakao_log, result);
                await deleteManyKakaoInfo(kakao_info, result);
                await scheduleRestart(scheduler, job);
            }
        });
        const job = new SimpleIntervalJob({seconds: 1}, task);
        //schedule start
        await scheduler.addSimpleIntervalJob(job);
    } catch (err) {
        logger.info(err);
    }
}

const checkMsgType = async (msg) => {
    try {
        let atArray = [];
        let ftArray = msg.reduce((acc, cur) => {
            if (cur.type == 'at') {
                atArray.push(cur);
            } else if (cur.type == 'ft') {
                acc.push(cur);
            }
            return acc;
        }, []);

        if (atArray.length > 0) {
            await request.sendAlarmTalkMessage(atArray);
            logger.debug(`atArray find count: ${atArray.length}`);
        }
        if (ftArray.length > 0) {
            await request.sendFriendTalkMessage(ftArray);
            logger.debug(`ftArray find count: ${ftArray.length}`);
        }
    } catch (err) {
        logger.info(err);
    }
}

const scheduleRestart = async (scheduler, job) => {
    try {
        logger.info('scheduler restart!');
        await scheduler.addSimpleIntervalJob(job);
    } catch (err) {
        logger.info(err);
    }
}

module.exports = watchMongoDB;