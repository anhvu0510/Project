const Module = require('./Module')
const Joi = require('mecore').Joi
const ResCode = require('project/constants/ResponseCode')



module.exports = [
    {
        method : 'POST',
        path : '/api/register',
        handler : Module,
        options : {
            description : "Đăng Kí",
            auth : false,
            validate : {
                payload : Joi.object({
                    username : Joi.string().min(8).pattern(/^\D[a-zA-Z0-9]{1,30}$/).required().example('Usertest01').description('Tên Đăng Nhập'),
                    password : Joi.string().min(6).required().example('helloword').description('Mật Khẩu'),
                    email : Joi.string().email().required().example('sodogi5277@idcbill.com').description('Email'),
                    fullname : Joi.string().required().example('Nguyễn Văn A').description('Tên đầy đủ'),
                    OTP: Joi.string().max(6).allow(null,'').example('').description('OTP')
                })
            },
            response: {
                status: {
                    [ResCode.REQUEST_SUCCESS]: Joi.object({
                        message : Joi
                            .string()
                            .example('Đăng kí thành công'),
                    }).description('Thành công'),
                    [ResCode.REQUEST_FAIL]: Joi.object({
                        message: Joi.string()
                            .example('Thất bại!')
                            .description('Lý do thất bại'),
                        OTP : Joi.string()
                            .allow(null,'')
                            .example('jfSwt')
                            .description('Mã OTP')
                    }).description('Thất bại')
                }
            },

            tags : ['api','Register']
        }
    },

    // {
    //     method:  'GET',
    //     path: '/api/register/{OTP}',
    //     handler: Module.verifyOTP,
    //     options: {
    //         description: 'Xác thực OTP khi đăng kí tài khoản',
    //         auth : 'Default',
    //         validate: {
    //             params : Joi.object({
    //                 OTP : Joi.string().max(6).required(),
    //             })
    //         },
    //         response : {
    //             status : {
    //                 [ResCode.REQUEST_SUCCESS] : Joi.object({
    //                     message : Joi.string(),
    //
    //                 }).description('Thành Công'),
    //                 [ResCode.REQUEST_FAIL] : Joi.object({
    //                     message : Joi.string()
    //                 }).description('Thất Bại')
    //             }
    //         },
    //         tags : ['api','Register']
    //     },
    // }
]