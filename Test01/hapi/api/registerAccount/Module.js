const _= require('lodash')

const ResCode = require('../../../constants/ResponseCode')
const User = require('project/models/Acount.Model')
const passwordHelper = require('project/helpers/passwordHelper')
const cacheHelper = require('project/helpers/cacheHelper')

const randomText = (length) =>{
    let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for ( let i = 0; i < length; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

module.exports = async (request,reply) => {
    try{
        const clientIP = request.clientIp;
        const {username,password,OTP} = request.payload

        //Check username
        const foundUser = await  User.findOne({username}).lean();
        if(_.get(foundUser,'id',false) === false){
            return  reply.api({
                message : 'Tên đăng nhập đã tồn tại'
            }).code(ResCode.REQUEST_FAIL)
        }
        //Check number account/ip
        let replyNumberIP = JSON.parse(await cacheHelper.getCathe(clientIP));

        //Create number of account/ip register
        if(_.isNil(replyNumberIP)){
            await cacheHelper.setCache(clientIP,1);
        }
        //Process ip have 3 account
        if(replyNumberIP === 3){
            let replyOTP = JSON.parse(await cacheHelper.getCathe('OTP-Register'));
            if(_.isNil(replyOTP)){
                const genOTP = randomText(6);
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
            await cacheHelper.delCache('OTP-Register');
        }else{
            await cacheHelper.setCache(clientIP,Number(++replyNumberIP));
        }
        //Hash password
        const hashPassword = passwordHelper.hashPassword(password);
        //Create User
        const newUser = await User.create({
            username,
            password : hashPassword
        });

        return reply.api({
            message : 'Đăng kí tài khoản thành công',
        }).code(ResCode.REQUEST_SUCCESS)
    }catch (e) {
        throw (e)
    }
}