const ResCode = require('../../../constants/ResponseCode')
const User = require('project/models/Acount.Model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const tokenKey = require('project/config/Authentication').jwtSecretKey
const _= require('lodash')

const randomText = (length) =>{
    let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for ( let i = 0; i < length; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}
const processRegister = async (request,reply) => {
    try{
        let OTP = null;
        const clientIP = request.clientIp;
        const {username,password} = request.payload

        //Check username
        const foundUser = await  User.find({username}).count();
        if(foundUser){
            return  reply.api({
                message : 'Account already exists'
            }).code(ResCode.REQUEST_FAIL)
        }
        //Check number account/ip
        const numAccount = await User.find({clientIP}).count() + 1;
        console.log(`IP ${clientIP} have : ${numAccount} account`)
        if(numAccount > 3){
            //Ramdom OTP
            OTP = randomText(6)
        }
        //Hash password
        const hashPassword = await bcrypt.hash(password,10);
        //Create User
        const newUser = await User.create({
            clientIP,
            username,
            password : hashPassword,
            OTP
        });
        //Genarate Token
        const token = await jwt.sign({id : newUser._id},tokenKey);


        return reply.api({
            message : 'Register Success',
            token
        }).code(ResCode.REQUEST_SUCCESS)
    }catch (e) {
        throw (e)
    }
}
const verifyOTP = async(request,reply) => {
    const userID = await jwt.verify(request.headers.authorization,tokenKey);
    const {OTP} = await User.findById(userID.id).select('OTP');

    if(_.isNull(OTP)){
        return reply.api({
            message : 'The Account is authenticated'
        }).code(ResCode.REQUEST_SUCCESS)
    }

    if(_.isEqual(OTP,request.params.OTP)){
        await User.update({_id : userID.id},{ OTP : null})
        return reply.api({
            message : 'OTP Match - Verify Success'
        }).code(ResCode.REQUEST_SUCCESS)
    }
    return reply.api({
        message : 'OTP Not Match - Check again'
    }).code(ResCode.REQUEST_FAIL)
}

module.exports = {
    processRegister,
    verifyOTP
}