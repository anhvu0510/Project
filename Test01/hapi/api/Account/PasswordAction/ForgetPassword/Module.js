const _ = require('lodash')

const accountModel = require('project/models/Acount.Model')
const ResCode = require('project/constants/ResponseCode')
const Redis = require('project/helpers/cacheHelper')


let randomText = (length) =>{
    let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for ( let i = 0; i < length; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

module.exports = async (request,h) => {
    // //Default OTP for Test
    // const test = JSON.parse(await Redis.getCathe('OTP_RESET_PASS'))
    // if(_.isNil(test)){
    //     await Redis.setCache('OTP_RESET_PASS',{text : "AAaaAA",count : 1})
    // }
    //
    //
    // const {OTP}  = request.params;
    //
    //
    // const Reply = JSON.parse((await Redis.getCathe('OTP_RESET_PASS')))
    // if(Reply.text === OTP){
    //     return h.api({message : 'OTP chính xác'}).code(ResCode.REQUEST_SUCCESS);
    // }else{
    //     if(Reply.count === 3){
    //         await Redis.setCache('OTP_RESET_PASS','LOCKED',5*60);
    //         return h.api({message : '[LOCKED] Không thể nhập trong 5 phút'}).code(ResCode.REQUEST_FAIL);
    //     }
    //     if(Reply === 'LOCKED'){
    //         const timeout = await Redis.getTimeOut("OTP_RESET_PASS");
    //         return h.api({message : `[LOCKED] Không thể nhập trong ${Math.floor(timeout/60)} phút`}).code(ResCode.REQUEST_FAIL);
    //     }else{
    //         Reply.count++;
    //         await Redis.setCache('OTP_RESET_PASS',Reply)
    //         return h.api({message : `OTP không chính xác`}).code(ResCode.REQUEST_FAIL);
    //     }
    // }
}


