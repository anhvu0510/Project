const _ = require('lodash')

const accountModel = require('project/models/accountModel')
const ResCode = require('project/constants/ResponseCode')
const Redis = require('project/helpers/cacheHelper')
const mailHelper = require('project/helpers/mailHelper')
const activeCodeModel = require('project/models/activeCodeModel')
const myHelper = require('project/helpers/myHelper')

const TIME_RESEND_ACTIVE_CODE = 30;

module.exports = async (request, reply) => {
    const {username} = request.payload;
    const [findAccount, timeoutResend] = await Promise.all([
        accountModel.findOne({username}).lean(),
        Redis.getTimeOut(`RESEND-OTP-${username}`)
    ])


    if (_.get(findAccount, 'id', false) === false) {
        return reply.api({
            message: 'Tên đăng nhập không tồn tại'
        }).code(ResCode.REQUEST_FAIL)
    }

    if (timeoutResend > 0) {
        return reply.api({
            message: `Vui lòng chờ trong ${timeoutResend} giây`
        }).code(ResCode.REQUEST_FAIL)
    }

    const genOTP = myHelper.randomText(6);
    const resultSendMail = await mailHelper.SendMailActive(
        findAccount.email,
        'ACTIVE CODE FORGET PASSWORD',
        {
            content: genOTP
        }
    )
    //Send mail fail
    if (_.get(resultSendMail, 'messageId', false) === false) {
        return reply.api({
            message: 'Sự Cố Kỹ Thuật - Vui Lòng Thử Lại Sau'
        }).code(ResCode.REQUEST_FAIL)
    }

    //Check active code model have code of username??
    const findeExisted = await activeCodeModel.findOne({username}).lean();

    if (_.get(findeExisted, 'id', false) === false) {
        //Create new active code in database
        const newCode = await activeCodeModel.create({
            username,
            code: genOTP,
        })
        //Fail create
        if (_.get(newCode, 'id', false) === false) {
            return reply.api({
                message: 'Sự Cố Kỹ Thuật - Vui Lòng Thử Lại Sau'
            }).code(ResCode.REQUEST_FAIL)
        }
    } else {
        //Existed code in database
        const resultUpdate = await activeCodeModel.update({id : findeExisted.id},{code : genOTP})
    }
    const result = Redis.setCache(`RESEND-OTP-${findAccount.username}`, 'ALIVE', TIME_RESEND_ACTIVE_CODE);

    return reply.api({
        message: 'Kiểm tra mail để lấy mã xác nhận'
    }).code(ResCode.REQUEST_SUCCESS);
}
