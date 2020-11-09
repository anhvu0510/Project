const Module = require('./Module')
const Joi = require('mecore').Joi
const ResCode = require('../../../constants/ResponseCode')

module.exports = [
    {
        method : 'POST',
        path : '/api/register',
        handler : Module.processRegister,
        options : {
            description : "Đăng Kí",
            auth : false,
            validate : {
                payload : Joi.object({
                    username : Joi.string().min(8).pattern(/^\D[a-zA-Z0-9]{1,}$/).required().description('Tên Đăng Nhập'),
                    password : Joi.string().min(6).required().description('Mật Khẩu'),
                })
            },
            response: {
                status: {
                    [ResCode.REQUEST_SUCCESS]: Joi.object({
                        message : Joi.string(),
                        token : Joi.string()
                    }).description('Thành công'),
                    [ResCode.REQUEST_FAIL]: Joi.object({
                        message: Joi.string().example('Thất bại!').description('Lý do thất bại')
                    }).description('Thất bại')
                }
            },

            tags : ['api','Register']
        }
    },
    {
        method:  'GET',
        path: '/api/register/{OTP}',
        handler: Module.verifyOTP,
        options: {
            description: 'Xác thực OTP khi đăng kí tài khoản',
            auth : 'Default',
            validate: {
                params : Joi.object({
                    OTP : Joi.string().max(6).required(),
                })
            },
            response : {
                status : {
                    [ResCode.REQUEST_SUCCESS] : Joi.object({
                        message : Joi.string(),

                    }).description('Thành Công'),
                    [ResCode.REQUEST_FAIL] : Joi.object({
                        message : Joi.string()
                    }).description('Thất Bại')
                }
            },
            tags : ['api','Register']
        },
    }
]