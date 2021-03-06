const _= require('lodash')

const ResCode = require('project/constants/ResponseCode')
const User = require('project/models/accountModel')
const passwordHelper = require('project/helpers/passwordHelper')
const cacheHelper = require('project/helpers/cacheHelper')
const myHelper = require('project/helpers/myHelper')


module.exports = async (request,reply) => {
    try{
        const clientIP = request.clientIp;
        const {username,password,OTP,email, fullname} = request.payload

        //Check username
        const foundUser = await  User.findOne({username}).lean();
        if(_.get(foundUser,'id',false) !== false){
            return  reply.api({
                message : 'Tên đăng nhập đã tồn tại'
            }).code(ResCode.REQUEST_FAIL)
        }
        if(_.get(foundUser,'email',false) !== false){
            return reply.api({
                message : 'Email đã được sử dụng'
            }).code(ResCode.REQUEST_FAIL);
        }
        //Check number account/ip
        let replyNumberIP = await cacheHelper.getCathe(`SIGN-UP-${clientIP}`);

        //Create number of account/ip register
        if(_.isNil(replyNumberIP)){
            replyNumberIP = await cacheHelper.setCache(`SIGN-UP-${clientIP}`,1);
        }
        //Process ip have 3 account
        if(replyNumberIP === 4){
            let replyOTP = await cacheHelper.getCathe('OTP-Register');
            if(_.isNil(replyOTP)){
                const genOTP = myHelper.randomText(6);
                await cacheHelper.setCache('OTP-Register',genOTP);
                replyOTP = genOTP
            }
            if(_.isEmpty(OTP)){
                return reply.api({
                    message : 'Vui lòng nhập mã OTP để đăng kí',
                    OTP : replyOTP
                }).code(ResCode.REQUEST_FAIL);
            }
            if(replyOTP !== OTP){
                return reply.api({
                    message : 'Mã OTP không khớp - Vui lòng nhập lại',
                    OTP : replyOTP
                }).code(ResCode.REQUEST_FAIL);
            }
            //delete OTP-Register
            const result = await cacheHelper.delCache('OTP-Register');
        }else{
            const result = await cacheHelper.setCache(`SIGN-UP-${clientIP}`,Number(++replyNumberIP));
        }
        //Hash password
        const hashPassword = passwordHelper.hashPassword(password);
        //Create User
        const newUser = await User.create({
            username,
            password : hashPassword,
            email,fullname
        });

        return reply.api({
            message : 'Đăng kí tài khoản thành công',
        }).code(ResCode.REQUEST_SUCCESS)
    }catch (e) {
        throw (e)
    }
}