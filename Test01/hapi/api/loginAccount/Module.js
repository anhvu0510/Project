const accountModel = require('../../../models/Acount.Model')
const ResCode = require('../../../constants/ResponseCode')
const Redis = require('ioredis')
const _ = require('lodash')
const bcrypt = require('bcrypt')
const User = require('project/models/Acount.Model');


const Client = new Redis({
    port :6379,
    host :'127.0.0.1',
})

const setCache = (key,value,timeout) =>{
   return new Promise((resolve,reject) => {
       let Result;
       if(_.isNil(key) || _.isNil(value)){
           return reject( new Error('Key Error'))
       }
       if(!_.isNil(timeout)){
           Result = Client.set(key,JSON.stringify(value),"EX",parseInt(timeout));
       }else {
           Result = Client.set(key,JSON.stringify(value));
       }
       Result.then(success => {
           resolve(success)
       }).catch((err) => {
           reject(err)
       })
   })

}
 const comparePassword = async(pass,hassPass) =>{
    if(_.isNil(pass) || _.isNil(hassPass)){
        return false
    }
    return bcrypt.compare(pass,hassPass).then(rs => rs).catch(err => err)
 }
 const checkLogin = async(request,user) =>{
    const {password} = request.payload
    if(_.isNil(user)){
        return {
            status : false,
            message : 'Tên đăng nhập không tồn tại'
        }
    }
     if(!(await comparePassword(password,user.password))){
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


module.exports = async(request,h)=>{
   try{
       const IP = request.clientIp;
       const {username,password} = request.payload;

       const user = await User.findOne({username}).exec();
       //Check login
       const {status,message} = await checkLogin(request,user);

       let reply = JSON.parse(await Client.get(IP))
       let replyUser = JSON.parse(await  Client.get(username))

       //Success login
       if(status === true && reply !== 'LOCKED_SPAM' && reply !== 'LOCKED' && replyUser !== 'LOCKED'){
           return h.api({message})
               .code(ResCode.REQUEST_SUCCESS)
       }else{
           //First Request => Set Catche in 1 minute
           if(_.isNil(reply)){
               setCache(IP,1,60)
           }
            //Save info login fail ( username and ip) to cache
           if(_.isNil(replyUser)){
               setCache(username,IP)
           }
           //Get timeout
           const timeout = await Client.call('ttl',IP).then()
           const timeoutAccLogin = await Client.call('ttl',username).then();
           //Login fail 3 times
           if(reply === 2){
               setCache(username,"LOCKED",5*60);
               setCache(IP,"LOCKED",1*60)
               return h.api({message : `[LOCKED LOGIN] IP ${IP} trong 1 phút và Username ${username}  trong 5 phút`})
                   .code(ResCode.REQUEST_FAIL)
           }
           //Count Request
           if(!_.isNaN(_.toNumber(reply))){
               setCache(IP,Number(++reply),timeout)
           }
           //Check locked IP
           if(reply === "LOCKED_SPAM" || reply === 'LOCKED'){
               return h.api({message : `[LOCKED LOGIN] IP ${IP} bị khóa đăng nhập trong ${Math.floor(timeout / 60)} phút`})
                   .code(ResCode.REQUEST_FAIL)
           }

           //Check locked username
           if(replyUser === "LOCKED"){
               return h.api({message : `[LOCKED LOGIN] USER: ${username} bị khóa đăng nhập trong ${Math.floor(timeoutAccLogin / 60)} phút`})
                   .code(ResCode.REQUEST_FAIL)
           }

           //Locked when login greater than 20 per IP
           if(reply === 20 && timeout > 0){
               setCache(IP,"LOCKED_SPAM",60*60)
               return h.api({message : `[SPAM LOGIN] IP ${IP} bị khóa đăng nhập trong 60 phút`})
                   .code(ResCode.REQUEST_FAIL)
           }
           return h.api({message}).code(ResCode.REQUEST_FAIL)
       }
   }catch (e) {
       throw (e);
   }
}

