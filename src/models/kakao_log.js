const logger = require('../util/logger');

export const insertManyKakaoLog = async (kakao_log, doc) => {
    try {
        await kakao_log.insertMany(doc);
        logger.info( '[kakao_log] insertMany complete.');
    } catch (err) {
        throw new Error('[kakao_log] insertMany error!');
    }
};