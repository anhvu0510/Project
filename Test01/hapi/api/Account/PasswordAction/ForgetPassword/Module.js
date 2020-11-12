const _ = require('lodash')

const accountModel = require('project/models/Acount.Model')
const ResCode = require('project/constants/ResponseCode')
const Redis = require('project/helpers/cacheHelper')
const mailHelper = require('project/helpers/mailHelper')
const activeCodeModel = require('project/models/ActiveCode.Model')

let randomText = (length) => {
    let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

module.exports = async (request, reply) => {
    console.log(activeCodeModel.create())
    const {email} = request.payload;
    const findAccount = await accountModel.findOne({email}).lean();
    if (_.get(findAccount, 'id', false) === false) {
        return reply.api({
            message: 'Email không tồn tại'
        }).code(ResCode.REQUEST_FAIL)
    }
    const genOTP = randomText(6);
    const resultSendMail = await mailHelper.SendMailActive(
        findAccount.email,
        'ACTIVE CODE FORGET PASSWORD',
        {
            content: genOTP,
            time: 30//seconds
        }
    )
    //Check send mail
    if (_.get(resultSendMail, 'messageId', false) === false) {
        return reply.api({
            message: 'Sự Cố Kỹ Thuật - Vui Lòng Thử Lại Sau'
        }).code(ResCode.REQUEST_FAIL)
    }

    const [result, newActive] = await Promise.all([
        Redis.setCache(`FORGET-OTP-${findAccount.email}`, genOTP, 30),
        activeCodeModel.create({
            userID: findAccount.id,
            code: genOTP,
        })
    ])

    if (_.get(newActive, 'id', false) === false) {
        const result = Redis.delCache(`FORGET-OTP-${findAccount.email}`)
        return reply.api({
            message: 'Sự Cố Kỹ Thuật - Vui Lòng Thử Lại Sau'
        }).code(ResCode.REQUEST_FAIL)
    }

    return reply.api({
        message: 'Kiểm tra mail để lấy mã xác nhận'
    }).code(ResCode.REQUEST_SUCCESS);

}


