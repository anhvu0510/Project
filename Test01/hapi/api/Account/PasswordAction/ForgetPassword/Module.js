const _ = require('lodash')

const activeCodeModel = require('project/models/activeCodeModel')
const accountModel = require('project/models/accountModel')
const ResCode = require('project/constants/ResponseCode')
const Redis = require('project/helpers/cacheHelper')
const myHelper = require('project/helpers/myHelper')
const passwordHelper = require('project/helpers/passwordHelper')

const TIME_LOCKED_INPUT = 5 * 60

module.exports = async (request, reply) => {
    const { username, password, OTP } = request.payload;
    let [cacheCountOTP, timeoutInputOTP] = await Promise.all([
        Redis.getCathe(`COUNT-OTP-${username}`),
        Redis.getTimeOut(`COUNT-OTP-${username}`)
    ]);
    //Check time out locked user
    if (timeoutInputOTP > 0) {
        const { h, m, s } = myHelper.getTimeFromSecond(timeoutInputOTP);
        return reply.api({
            message: `User: ${username} bị khóa nhập liệu trong ${m} phút ${s} giây`
        }).code(ResCode.REQUEST_FAIL);
    }

    const findOTP = await activeCodeModel.findOne({
        username,
        code : OTP
    }).lean();

    if(_.get(findOTP,'id',false) === false){
        if (_.isNil(cacheCountOTP)) {
            cacheCountOTP = await Redis.setCache(`COUNT-OTP-${username}`, 1);
        }
        if (cacheCountOTP === 3) {
            const { h, m, s } = myHelper.getTimeFromSecond(TIME_LOCKED_INPUT);
            const result = await Redis.setCache(`COUNT-OTP-${username}`, 'LOCKED', TIME_LOCKED_INPUT);
            return reply.api({
                message: `[LOCKED] User: ${username} bị khóa nhập liệu trong ${m} phút ${s} giây`
            }).code(ResCode.REQUEST_FAIL);
        } else {
            const result = await Redis.setCache(`COUNT-OTP-${username}`, Number(++cacheCountOTP));
        }
        return reply.api({
            message :'Mã OTP không chính xác'
        }).code(ResCode.REQUEST_FAIL)
    }

    //Delete Cache and OTP used
    const result = await Redis.delCache(`COUNT-OTP-${username}`);
    const resultUpdateOTP = await activeCodeModel.update({username,code :OTP},{code : null})

    //Update password
    const updateResult = await accountModel.update({ username }, { password: passwordHelper.hashPassword(password) })
    if (!updateResult.ok) {
        return reply.api({
            message: 'Thay đổi mật khẩu thất bại'
        }).code(ResCode.REQUEST_FAIL)
    }

    return reply.api({
        message: 'Thay đổi mật khẩu thành công'
    }).code(ResCode.REQUEST_FAIL)
}


