const _ = require('lodash')
const Async = require('async')

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
    //Create queue send mail
    const sendActiveMailQueue = Async.queue(function (task, callback) {
        console.log('Running Task ' + task.name)
        mailHelper.SendMailActive(task.to, task.subject, task.obj)
            .then(info => {
                callback(info)
            })
    }, 1);
    //Push send mail action to queue
    sendActiveMailQueue.push({
        name: 'Send mail',
        to: findAccount.email,
        subject: 'ACTIVE CODE FORGET PASSWORD',
        obj: {
            content : genOTP
        }
    }, async function(rs) {
        const findExisted = await activeCodeModel.findOne({username}).lean();

        if (_.get(findExisted, 'id', false) === false) {
            //Create new active code in database
            const newCode = await activeCodeModel.create({
                username,
                code: genOTP,
            })
        } else {
            //Existed code in database
            const resultUpdate = await activeCodeModel.update({id : findExisted.id},{code : genOTP})
        }
        const result = await Redis.setCache(`RESEND-OTP-${findAccount.username}`, 'ALIVE', TIME_RESEND_ACTIVE_CODE);
    })
    /*const resultSendMail = await mailHelper.SendMailActive(
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
    const result = Redis.setCache(`RESEND-OTP-${findAccount.username}`, 'ALIVE', TIME_RESEND_ACTIVE_CODE);*/

    return reply.api({
        message: 'Kiểm tra mail để lấy mã xác nhận'
    }).code(ResCode.REQUEST_SUCCESS);
}
