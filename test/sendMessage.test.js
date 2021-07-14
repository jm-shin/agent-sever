const {describe, test} = require("@jest/globals");

const { sendAlarmTalkMessage, sendFriendTalkMessage } = require('../src/util/sendMessage');

describe('알람톡 테스트', () => {
    const info = {
        "phone_no":"9ESq0CGky9XdTwrcxZJ4Ug==",
        "name":"이름",
        "idx":1,
        "coupon_value":"111-111-111",
        "campaign_id":1,
        "index":1,
        "msg_id":null,
        "callback_no":"0000-0000",
        "senderkey":"senderkey",
        "templatecode":"templatecode",
        "button":"[{\"type\":\"WL\",\"name\":\"name\",\"url_mobile\":\"https://\",\"url_pc\":\"https://\",\"tableData\":{\"id\":0}},{\"type\":\"AL\",\"name\":\"title\",\"scheme_android\":\"https://link\"," +
            "\"scheme_ios\":\"https://link\",\"tableData\":{\"id\":1}}]","quickreply":"[]","resend_flag":1,"resend":"{\"first\":\"mms\"}",
        "enc":1,
        "is_request":0,
        "request_result":0,
        "created_at":"2021-07-14T15:00:00.000Z",
        "request_date":null,
        "type":"at",
        "pms_id":1,
        "message":"메시지내용",
        "title":"제목",
        "recontent":"{\"mms\":{\"message\":\"쿠폰 :%coupon%\\유효기간: 테스트 중\",\"file\":[{\"type\":\"IMG\",\"key\":\"image.jpg\"}],\"subject\":\"MMS 대체발송 테스트\"}}"};

    test('msg 변환 기능', () => {
        expect(sendAlarmTalkMessage(info)).toBe({})
    });
});
