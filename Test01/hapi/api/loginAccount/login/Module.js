const _ = require('lodash')
const bcrypt = require('bcrypt')

const accountModel = require('project/models/Acount.Model')
const ResCode = require('project/constants/ResponseCode')
const User = require('project/models/Acount.Model');
const Redis = require('project/helpers/cacheHelper')
const passwordHelper = require('project/helpers/passwordHelper')


const TIME_LOCK_SPAM_LOGIN = 60 * 60;
const TIME_LOCK_LOGIN_US = 5 * 60;
const TIME_LOCK_LOGIN_IP = 1 * 60;

const checkLogin = async (request, user) => {
    const {password} = request.payload
    if (_.isNil(user)) {
        return {
            status: false,
            message: 'Tên đăng nhập không tồn tại'
        }
    }
    if (!passwordHelper.comparePassword(password, user.password)) {
        return {
            status: false,
            message: 'Mật khẩu không chính xác'
        }
    }
    return {
        status: true,
        message: 'Đăng nhập thành công'
    }
}


module.exports = async (request, h) => {
    try {
        const IP = request.clientIp;
        const {username, password} = request.payload;
        const user = await User.findOne({username}).lean();
        //Check login
        const {status, message} = await checkLogin(request, user);

        let reply = JSON.parse(await Redis.getCathe(IP))
        let replyUser = JSON.parse(await Redis.getCathe(username))

        //Success login
        if ((status === true) && (reply !== 'LOCKED_SPAM') && (reply !== 'LOCKED') && (replyUser !== 'LOCKED')) {
            return h.api({message})
                .code(ResCode.REQUEST_SUCCESS)
        } else {
            //First Request => Set Catche in 1 minute
            if (_.isNil(reply)) {
                const result = await Redis.setCache(IP, 1, 60)
            }
            //Create number of login
            if (_.isNil(replyUser)) {
                const result = await Redis.setCache(username, 1)
            }
            //Get timeout
            const timeout = await Redis.getTimeOut(IP)
            const timeoutAccLogin = await Redis.getTimeOut(username);

            //Check IP
            if (reply === 20 && timeout > 0) {
                const result = await Redis.setCache(IP, "LOCKED_SPAM", TIME_LOCK_SPAM_LOGIN)
                return h.api({message: `[SPAM LOGIN] IP ${IP} bị khóa đăng nhập trong 60 phút`})
                    .code(ResCode.REQUEST_FAIL)
            } else if (reply === "LOCKED_SPAM") {
                return h.api({message: `[SPAM LOGIN] IP ${IP} bị khóa đăng nhập trong ${Math.floor(timeout / 60)} phút`})
                    .code(ResCode.REQUEST_FAIL)
            } else if (reply === 'LOCKED') {
                return h.api({message: `[LOCKED LOGIN] IP ${IP} bị khóa đăng nhập trong ${timeout} phút`})
                    .code(ResCode.REQUEST_FAIL)
            } else {
                const result = await Redis.setCache(IP, Number(++reply), timeout)
            }

            //Check Username
            if (replyUser === 2) {
                const resultUS = await Redis.setCache(username, "LOCKED", TIME_LOCK_LOGIN_US);
                const resultIP = await Redis.setCache(IP, "LOCKED", TIME_LOCK_LOGIN_IP)
                return h.api({message: `[LOCKED LOGIN] IP ${IP} trong 1 phút và Username ${username}  trong 5 phút`})
                    .code(ResCode.REQUEST_FAIL)
            } else if (replyUser === 'LOCKED') {
                return h.api({message: `[LOCKED LOGIN] USER: ${username} bị khóa đăng nhập trong ${Math.floor(timeoutAccLogin / 60)} phút`})
                    .code(ResCode.REQUEST_FAIL)
            } else {
                const result = await Redis.setCache(username, Number(++replyUser));
            }
            return h.api({message}).code(ResCode.REQUEST_FAIL)
        }
    } catch (e) {
        throw (e);
    }
}
