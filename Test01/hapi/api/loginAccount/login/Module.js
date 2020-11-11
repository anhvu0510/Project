const _ = require('lodash')
const bcrypt = require('bcrypt')

const accountModel = require('project/models/Acount.Model')
const ResCode = require('project/constants/ResponseCode')
const User = require('project/models/Acount.Model');
const Redis = require('project/helpers/cacheHelper')
const passwordHelper = require('project/helpers/passwordHelper')

const randomText = (length) =>{
    let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for ( let i = 0; i < length; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

 const checkLogin = async(request,user) =>{
    const {password} = request.payload
    if(_.isNil(user)){
        return {
            status : false,
            message : 'Tên đăng nhập không tồn tại'
        }
    }
     if(!(await passwordHelper.comparePassword(password,user.password))){
         return {
             status : false,
             message : 'Mật khẩu không chính xác'
         }
     }
     if(!_.isNil(user.OTP)){
         return {
             status : false,
             message : 'Chưa xác thực OTP'
         }
     }
     return {
         status : true,
         message : 'Đăng nhập thành công'
     }
 }
 const processLogin = async (request,h)=>{
    try{
        const IP = request.clientIp;
        const {username,password} = request.payload;
        const user = await User.findOne({username}).exec();
        //Check login
        const {status,message} = await checkLogin(request,user);

        let reply = JSON.parse(await Redis.getCathe(IP))
        let replyUser = JSON.parse(await  Redis.getCathe(username))

        //Success login
        if((status === true) && (reply !== 'LOCKED_SPAM') && (reply !== 'LOCKED') && (replyUser !== 'LOCKED')){
            return h.api({message})
                .code(ResCode.REQUEST_SUCCESS)
        }else{
            //First Request => Set Catche in 1 minute
            if(_.isNil(reply)){
                await Redis.setCache(IP,1,60)
            }
            //Save info login fail ( username and ip) to cache
            if(_.isNil(replyUser)){
                await Redis.setCache(username, IP)
            }
            //Get timeout
            const timeout = await Redis.getTimeOut(IP)
            const timeoutAccLogin = await Redis.getTimeOut(username);
            //Login fail 3 times
            if(reply === 2){
                await Redis.setCache(username,"LOCKED",5*60);
                await Redis.setCache(IP,"LOCKED",1*60)
                return h.api({message : `[LOCKED LOGIN] IP ${IP} trong 1 phút và Username ${username}  trong 5 phút`})
                    .code(ResCode.REQUEST_FAIL)
            }
            //Count Request
            if(!_.isNaN(_.toNumber(reply))){
                await Redis.setCache(IP,Number(++reply),timeout)
            }
            //Check locked IP
            if(reply === "LOCKED_SPAM" || reply === 'LOCKED'){
                return h.api({message : `[LOCKED LOGIN] IP ${IP} bị khóa đăng nhập trong ${timeout} giây`})
                    .code(ResCode.REQUEST_FAIL)
            }
            //Check locked username
            if(replyUser === "LOCKED"){
                return h.api({message : `[LOCKED LOGIN] USER: ${username} bị khóa đăng nhập trong ${Math.floor(timeoutAccLogin / 60)} phút`})
                    .code(ResCode.REQUEST_FAIL)
            }
            //Locked when login greater than 20 per IP
            if(reply === 20 && timeout > 0){
                await Redis.setCache(IP,"LOCKED_SPAM",60*60)
                return h.api({message : `[SPAM LOGIN] IP ${IP} bị khóa đăng nhập trong 60 phút`})
                    .code(ResCode.REQUEST_FAIL)
            }
            return h.api({message}).code(ResCode.REQUEST_FAIL)
        }
    }catch (e) {
        throw (e);
    }
}

const processResetPassword = async (request,h) => {
    const Reply = JSON.parse(await Redis.getCathe('OTP'))
    const {OTP}  = request.params;
    //Default OTP for Test
    if(_.isNil(Reply)){
        await Redis.setCache('OTP',{text : "AAaaAA",count : 1})
    }
    if(Reply.text === OTP){
        return h.api({message : 'OTP chính xác'}).code(ResCode.REQUEST_SUCCESS);
    }else{
        if(Reply.count === 3){
            await Redis.setCache('OTP','LOCKED',5*60);
            return h.api({message : '[LOCKED] Không thể nhập trong 5 phút'}).code(ResCode.REQUEST_FAIL);
        }
        if(Reply === 'LOCKED'){
            const timeout = await Redis.getTimeOut("OTP");
            return h.api({message : `[LOCKED] Không thể nhập trong ${Math.floor(timeout/60)} phút`}).code(ResCode.REQUEST_FAIL);
        }else{
            Reply.count++;
            await Redis.setCache('OTP',Reply)
            return h.api({message : `OTP không chính xác`}).code(ResCode.REQUEST_FAIL);
        }
    }
}

module.exports = {
   processLogin,
    processResetPassword
}

