const _ = require('lodash')

const accountModel = require('project/models/accountModel')
const ResCode = require('project/constants/ResponseCode')
const Redis = require('project/helpers/cacheHelper')
const myHelper = require('project/helpers/myHelper')
const passwordHelper = require('project/helpers/passwordHelper')

const TIME_LOCKED_INPUT =  5*60

module.exports = async (request, reply) => {
    const {username, password, OTP} = request.payload;
    let [cacheOTP, cacheCountOTP, timeoutInputOTP] = await Promise.all([
        Redis.getCathe(`FORGET-OTP-${username}`),
        Redis.getCathe(`COUNT-OTP-${username}`),
        Redis.getTimeOut(`COUNT-OTP-${username}`)
    ]);
    //Check time out locked user
    if (timeoutInputOTP > 0) {
        const {h, m, s} = myHelper.getTimeFromSecond(timeoutInputOTP);
        return reply.api({
            message: `User: ${username} bị khóa nhập liệu trong ${m} phút ${s} giây`
        }).code(ResCode.REQUEST_FAIL);
    }

    if (_.isNil(cacheOTP)) {
        return reply.api({
            message: 'Mã OTP đã hết hạn'
        }).code(ResCode.REQUEST_FAIL);
    }

    if (OTP !== cacheOTP) {
        if (_.isNil(cacheCountOTP)) {
            cacheCountOTP = await Redis.setCache(`COUNT-OTP-${username}`, 1);
        }
        if (cacheCountOTP === 3) {
            const {h,m,s} = myHelper.getTimeFromSecond(TIME_LOCKED_INPUT);
            const result = await Redis.setCache(`COUNT-OTP-${username}`, 'LOCKED', TIME_LOCKED_INPUT);
            return reply.api({
                message: `[LOCKED] User: ${username} bị khóa nhập liệu trong ${m} phút ${s} giây`
            }).code(ResCode.REQUEST_FAIL);
        } else {
            const result = await Redis.setCache(`COUNT-OTP-${username}`, Number(++cacheCountOTP));
        }
        return reply.api({
            message: `Mã OTP không chính xác.`
        }).code(ResCode.REQUEST_FAIL);
    }
    //Delete Cache
    const [result1, result2] = await Promise.all([
        Redis.delCache(`COUNT-OTP-${username}`),
        Redis.delCache(`FORGET-OTP-${username}`),
    ])

    //Update password
    const updateResult = await accountModel.update({username}, {password: passwordHelper.hashPassword(password)})
    if (!updateResult.ok) {
        return reply.api({
            message: 'Thay đổi mật khẩu thất bại'
        }).code(ResCode.REQUEST_FAIL)
    }
    return reply.api({
        message: 'Thay đổi mật khẩu thành công'
    }).code(ResCode.REQUEST_FAIL)


}


