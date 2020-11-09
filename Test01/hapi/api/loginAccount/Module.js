const accountModel = require('../../../models/Acount.Model')
const ResCode = require('../../../constants/ResponseCode')
const Redis = require('ioredis')
const _ = require('lodash')
const bcrypt = require('bcrypt')
const User = require('project/models/Acount.Model');


const redis = new Redis({
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
           Result = redis.set(key,JSON.stringify(value),"EX",parseInt(timeout));
       }else {
           Result = redis.set(key,JSON.stringify(value));
       }
       Result.then(success => {
           resolve(success)
       }).catch((err) => {
           reject(err)
       })
   })

}
 const comparePassword = async(pass,hassPass) =>{
    const valid = await bcrypt.compare(pass,hassPass)
     console.log(valid)
 }

module.exports = async(request,h)=>{
   try{
       const IP = request.clientIp;
       const {username,password} = request.payload;

       const user = User.findOne({username});
       if(!user){
           console.log('User khong ton tai')
       }
       comparePassword(password,user.password)

       return h.api({}).code(ResCode.REQUEST_SUCCESS)
   }catch (e) {
       throw (e);
   }
}

