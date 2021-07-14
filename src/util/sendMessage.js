const request = require('request-promise-native');
const kakaoConfig = require('../models/kakao_conf');
const logger = require('./logger');
const crypto = require("crypto");

//config
const account = process.env.ACCOUNT;
const algorithm = process.env.ALGORITHM;
const key = process.env.KEY;
const iv = process.env.IV;
const url = process.env.MSG_URL;

const cleanEmpty = (obj) => {
    if (Array.isArray(obj)) {
        return obj
            .map(v => (v && typeof v === 'object') ? cleanEmpty(v) : v)
            .filter(v => !(v == null));
    } else {
        return Object.entries(obj)
            .map(([k, v]) => [k, v && typeof v === 'object' ? cleanEmpty(v) : v])
            .reduce((a, [k, v]) => (v == null ? a : (a[k]=v, a)), {});
    }
}

const decrypt = (value) => {
    const fn = "decrypt";
    try {
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let result = decipher.update(value, "base64", "utf8");
        result += decipher.final("utf-8");
        // logger.debug(`decrypt result [${result}]`);
        return result.replace(/(\r\n\t|\n|\r\t)/gm,"");
    } catch (error) {
        logger.debug(`${fn} fail [${error}]`);
    }
};

//alarmtalk only
const sendAlarmTalkMessage = async (info) => {
    try {
        const token = await kakaoConfig.selectToken();

        //commonBody
        const commonBody = await info.reduce((acc, cur, i) => {

            //new
            let button;
            //quickreply
            if (typeof cur.quickreply == "undefined" || cur.quickreply == "[]" || cur.quickreply == "" || cur.quickreply == null ) {
                delete cur.quickreply;
            }
            //title
            if (typeof cur.title == "undefined" || cur.title == "" || cur.title == null) {
                delete cur.title;
            }
            //button
            if (typeof cur.button == "undefined" || cur.button == "[]" || cur.button == "" ||  cur.button == null ){
                delete cur.button;
                button = null;
            } else {
                const jsonButton = JSON.parse(cur.button);
                button = jsonButton.reduce((acc, cur, i) => {
                    delete cur.tableData;
                    acc.push(cur);
                    return acc;
                }, []);
            }

            let form;
            let commonForm = {
                message: cur.message,
                senderkey: cur.senderkey,
                templatecode: cur.templatecode,
                button: cur.button? button : null,
                quickreply: cur.quickreply? cur.quickreply : null,
                title: cur.title? cur.title : null,
            }
            const atForm = cleanEmpty(commonForm);

            if (typeof cur.resend_flag == "undefined" || cur.resend_flag == 0) {
                form = {
                    account: account,
                    refkey: cur.campaign_id.toString(),
                    type: 'at',
                    from: cur.callback_no,
                    to: decrypt(cur.phone_no),
                    content: {
                        at: atForm
                    }
                };
            } else if (cur.resend_flag == 1) {
                form = {
                    account: account,
                    refkey: cur.campaign_id.toString(),
                    type: 'at',
                    from: cur.callback_no,
                    to: decrypt(cur.phone_no),
                    content: {
                        at: atForm
                    },
                    resend: JSON.parse(cur.resend),
                    recontent: JSON.parse(cur.recontent)
                };
            }

            acc.push(form);
            return acc;
        }, []);

        //요청 준비
        const message = await commonBody.reduce((acc, cur, arr) => {
            const option = {
                url: url,
                method: 'POST',
                json: true,
                headers: {
                    'Content-Type' : 'application/json; charset=utf-8',
                    'Authorization': 'Bearer ' + token,
                },
                body: cur,
            };
            acc.push(option);
            return acc;
        }, []);

        //logger.info('[AlarmTalk] sendMessageForm: ' + JSON.stringify(message));

        const requests = await message.map((msg) => request(msg));

        //log
        await message.forEach((cur, index) => {
            delete cur.body.to;
            logger.info(`[AlarmTalk] sendMessageForm[${index}]: ${JSON.stringify(cur)}`);
        });

        await Promise.all(requests)
            .then(response => {
                //logger.debug(`api response: ${JSON.stringify(response)}`);
                logger.info(`api response: ${JSON.stringify(response)}`);
            })
            .catch(e => logger.info(e.message));

    } catch(err) {
        logger.info(err);
    }
}

//FT
const sendFriendTalkMessage = async (info) => {
    try {
        const token = await kakaoConfig.selectToken();

        //commonBody
        const commonBody = await info.reduce((acc, cur, i) => {
            let button;
            //image
            if (typeof cur.image == "undefined" || cur.image == "[]" || cur.image == "" || cur.image == null) {
                delete cur.image;
            }
            //button
            if (typeof cur.button == "undefined" || cur.button == "[]" || cur.button == "" ||  cur.button == null ){
                delete cur.button;
                button = null;
            } else {
                const jsonButton = JSON.parse(cur.button);
                button = jsonButton.reduce((acc, cur, i) => {
                    delete cur.tableData;
                    acc.push(cur);
                    return acc;
                }, []);
            }

            const commonForm = {
                message: cur.message,
                senderkey: cur.senderkey,
                button: cur.button? button : null,
                image: cur.image? JSON.parse(cur.image) : null,
                userkey: cur.userkey? cur.userkey : null,
                adflag: cur.adflag? cur.adflag : null,
                wide: cur.wide? cur.wide : null,
            }
            const ftForm = cleanEmpty(commonForm);

            let form;
            if (typeof cur.resend_flag == "undefined" || cur.resend_flag == 0) {
                form = {
                    account: account,
                    refkey: cur.campaign_id.toString(),
                    type: 'ft',
                    from: cur.callback_no,
                    to: decrypt(cur.phone_no),
                    content: {
                        ft: ftForm
                    }
                };
            } else if (cur.resend_flag == 1) {
                form = {
                    account: account,
                    refkey: cur.campaign_id.toString(),
                    type: 'ft',
                    from: cur.callback_no,
                    to: decrypt(cur.phone_no),
                    content: {
                        ft: ftForm
                    },
                    resend: JSON.parse(cur.resend),
                    recontent: JSON.parse(cur.recontent)
                };
            }
            acc.push(form);
            return acc;
        }, []);

        //최종 message
        const message = await commonBody.reduce((acc, cur, arr) => {
            const option = {
                url: url,
                method: 'POST',
                json: true,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': 'Bearer ' + token,
                },
                body: cur,
            };
            acc.push(option);
            return acc;
        }, []);

        //logger.info('[FriendTalk] sendMessageForm: ' + JSON.stringify(message));

        const requests = await message.map((msg) => request(msg));

        //log
        await message.forEach((cur, index) => {
            delete cur.body.to;
            logger.info(`[FriendTalk] sendMessageForm[${index}]: ${JSON.stringify(cur)}`);
        });

        await Promise.all(requests)
            .then(response => {
                logger.info(`api response: ${JSON.stringify(response)}`);
            })
            .catch(e => logger.info(e.message));

    } catch (err) {
        logger.info(err);
    }
}

module.exports.sendAlarmTalkMessage = sendAlarmTalkMessage;
module.exports.sendFriendTalkMessage = sendFriendTalkMessage;