const Module = require('./Module');
const Joi = require('mecore').Joi;
const ResponseCode = require('project/constants/ResponseCode')

module.exports = [{
    method : 'POST',
    path : '/api/update-password',
    handler : Module,
    options : {
        description : "Cập Nhật Mật Khẩu Mới",
        auth : false,
        validate : {
            payload : Joi.object({
                OTP : Joi.string().max(6).example('AjEglo').required(),
                newPassword : Joi.string().required().example('hellowordl')
            })
        },
        response: {
            status: {
                [ResponseCode.REQUEST_SUCCESS]: Joi.object({
                    message : Joi.string().example('Thay đổi mật khẩu thành công')
                }).description('Thành công'),
                [ResponseCode.REQUEST_FAIL]: Joi.object({
                    message: Joi.string().example('Thất bại!').description('Lý do thất bại')
                }).description('Thất bại')
            },
        },
        tags : ['api','Password Action']
    }
}]
