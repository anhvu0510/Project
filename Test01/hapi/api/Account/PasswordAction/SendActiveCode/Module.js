const _ = require('lodash')

const accountModel = require('project/models/accountModel')
const ResCode = require('project/constants/ResponseCode')
const Redis = require('project/helpers/cacheHelper')
const mailHelper = require('project/helpers/mailHelper')
const activeCodeModel = require('project/models/activeCodeModel')

let randomText = (length) => {
    let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

const TIME_EXPIRE_ACTIVE_CODE = 30;

module.exports = async (request, reply) => {
    const {username} = request.payload;
    const findAccount = await accountModel.findOne({username}).lean();
    if (_.get(findAccount, 'id', false) === false) {
        return reply.api({
            message: 'Tên đăng nhập không tồn tại'
        }).code(ResCode.REQUEST_FAIL)
    }
    const genOTP = randomText(6);
    const resultSendMail = await mailHelper.SendMailActive(
        findAccount.email,
        'ACTIVE CODE FORGET PASSWORD',
        {
            content: genOTP,
            time: TIME_EXPIRE_ACTIVE_CODE//seconds
        }
    )
    //Send mail fail
    if (_.get(resultSendMail, 'messageId', false) === false) {
        return reply.api({
            message: 'Sự Cố Kỹ Thuật - Vui Lòng Thử Lại Sau'
        }).code(ResCode.REQUEST_FAIL)
    }
    //Set cache
    const result = await Redis.setCache(`FORGET-OTP-${findAccount.username}`, genOTP, TIME_EXPIRE_ACTIVE_CODE);
    //Check write cache
    if(result !== genOTP){
        return reply.api({
            message: 'Sự Cố Kỹ Thuật - Vui Lòng Thử Lại Sau'
        }).code(ResCode.REQUEST_FAIL)
    }
    //Write active code to database
    const newCode = await activeCodeModel.create({
        userID: findAccount.id,
        code: genOTP,
    })
    //Can not write active code to database
    if (_.get(newCode, 'id', false) === false) {
        const result = Redis.delCache(`FORGET-OTP-${findAccount.username}`)
        return reply.api({
            message: 'Sự Cố Kỹ Thuật - Vui Lòng Thử Lại Sau'
        }).code(ResCode.REQUEST_FAIL)
    }

    return reply.api({
        message: 'Kiểm tra mail để lấy mã xác nhận'
    }).code(ResCode.REQUEST_SUCCESS);
}


