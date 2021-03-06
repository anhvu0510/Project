const _ = require('lodash')


const ResCode = require('project/constants/ResponseCode')
const User = require('project/models/accountModel');
const Redis = require('project/helpers/cacheHelper')
const passwordHelper = require('project/helpers/passwordHelper')
const myHelper = require('project/helpers/myHelper')


const TIME_LOCK_SPAM_LOGIN = 60 * 60;
const TIME_LOCK_LOGIN_US = 5 * 60;
const TIME_LOCK_LOGIN_IP = 5 * 60;

module.exports = async (request, reply) => {
    try {
        const IP = request.clientIp;
        const {username, password} = request.payload;
        const findUser = await User.findOne({username}).lean();
        //Check user name
        if (_.get(findUser, 'id', false) === false) {
            return reply.api({
                message: 'Tên Đăng Nhập Không Tồn Tại'
            }).code(ResCode.REQUEST_FAIL)
        }
        //Check timeout
        let [replyIP, replyUser, timeoutIP, timeoutUser] = await Promise.all([
            Redis.getCathe(`LOGIN-${IP}`),
            Redis.getCathe(`LOGIN-${username}`),
            Redis.getTimeOut(`LOGIN-${IP}`),
            Redis.getTimeOut(`LOGIN-${username}`)
        ]);

        if (timeoutIP > 0 && replyIP === 'LOCKED') {
            const {h, m, s} = myHelper.getTimeFromSecond(timeoutIP);
            return reply.api({
                message: `[LOCKED] IP : ${IP} bị khóa trong ${h} giờ ${m} phút ${s} giây`
            }).code(ResCode.REQUEST_FAIL)
        }

        if (timeoutUser > 0) {
            const {h, m, s} = myHelper.getTimeFromSecond(timeoutUser);
            return reply.api({
                message: `[LOCKED] User : ${username} bị khóa trong ${h} giờ ${m} phút ${s} giây`
            }).code(ResCode.REQUEST_FAIL)
        }
        //Check password
        if (!passwordHelper.comparePassword(password, findUser.password)) {
            if (_.isNil(replyIP)) {
                replyIP = await Redis.setCache(`LOGIN-${IP}`, 1, 60);
            }
            if (_.isNil(replyUser)) {
                replyUser = await Redis.setCache(`LOGIN-${username}`, 1);
            }
            //Process Locked IP
            if (replyIP === 20) {
                const result = await Redis.setCache(`LOGIN-${IP}`, 'LOCKED', TIME_LOCK_SPAM_LOGIN)
                const {h, m, s} = myHelper.getTimeFromSecond(TIME_LOCK_SPAM_LOGIN);
                return reply.api({
                    message: `[LOCKED SPAM] : IP ${IP} bị khóa trong ${h} giờ ${m} phút ${s} giây`
                }).code(ResCode.REQUEST_FAIL)
            } else {
                timeoutIP = await Redis.getTimeOut(`LOGIN-${IP}`)
                const result = await Redis.setCache(`LOGIN-${IP}`, Number(++replyIP), timeoutIP)
            }
            //Process Locked User
            if (replyUser === 3) {
                const [resultUS, resultIP] = await Promise.all([
                    Redis.setCache(`LOGIN-${username}`, 'LOCKED', TIME_LOCK_LOGIN_US),
                    Redis.setCache(`LOGIN-${IP}`, 'LOCKED', TIME_LOCK_LOGIN_IP)
                ])
                const {h, m, s} = myHelper.getTimeFromSecond(TIME_LOCK_SPAM_LOGIN);
                return reply.api({
                    message: `[LOCKED] IP:${IP} & User: ${username} ${h} giờ ${m} phút ${s} giây`
                }).code(ResCode.REQUEST_FAIL)
            } else {
                const result = await Redis.setCache(`LOGIN-${username}`, (++replyUser));
            }

            return reply.api({
                message: 'Mật Khẩu Không Chính Xác'
            }).code(ResCode.REQUEST_FAIL)
        }

        //Delete Redis
        const result = await Redis.delCache(`LOGIN-${username}`);
        //Login Succsess
        return reply.api({
            message: 'Đăng Nhập Thành Công'
        }).code(ResCode.REQUEST_FAIL)

    } catch (e) {
        throw (e);
    }
}
