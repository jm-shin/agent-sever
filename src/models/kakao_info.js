const logger = require('../util/logger');

export const findKaKaoInfo = async (kakao_info) => {
    try {
        logger.info( '[kakao_info] find kakaoInfo complete.');
        return kakao_info.find({}).limit(150).toArray();
    } catch (err) {
        throw new Error('[kakao_info] find KaKaoInfo error!');
    }
};

export const deleteManyKakaoInfo = async (kakao_info, doc) => {
    try {
        const doc_id = await doc.reduce((acc, cur ) => {
            acc.push(cur._id);
            return acc;
        }, []);
        await kakao_info.deleteMany({_id : {$in : doc_id }});
        logger.info('[kakao_info] deleteMany KakaoInfo complete');
    } catch (err) {
        throw new Error('[kakao_info] deleteMany Kakao Info error!');
    }
};