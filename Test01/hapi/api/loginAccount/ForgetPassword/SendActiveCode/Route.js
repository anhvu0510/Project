const Module = require('./Module');
const Joi = require('mecore').Joi;
const ResponseCode = require('project/constants/ResponseCode')

module.exports = [{
    method : 'GET',
    path : '/api/reset/{OTP}',
    handler : Module,
    options : {
        description : "Đặt Lại Mật Khẩu",
        auth : false,
        validate : {
            params : Joi.object({
                OTP : Joi.string()
                    .max(6)
                    .example('AAaaAA')
                    .required()
            }).options({abortEarly : true,})
        },
        response: {
            status: {
                [ResponseCode.REQUEST_SUCCESS]: Joi.object({
                    message : Joi.string()
                }).description('Thành công'),
                [ResponseCode.REQUEST_FAIL]: Joi.object({
                    message: Joi.string().example('Thất bại!').description('Lý do thất bại')
                }).description('Thất bại')
            },
        },
        tags : ['api','Login','Reset Password']
    }
}]
