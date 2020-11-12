const Module = require('./Module');
const Joi = require('mecore').Joi;
const ResponseCode = require('project/constants/ResponseCode')

module.exports = [{
    method : 'POST',
    path : '/api/forget-password',
    handler : Module,
    options : {
        description : "Đặt Lại Mật Khẩu",
        auth : false,
        validate : {
            payload : Joi.object({
                email : Joi.string().email().example('sodogi5277@idcbill.com').required()
            }).options({abortEarly : true,})
        },
        response: {
            status: {
                [ResponseCode.REQUEST_SUCCESS]: Joi.object({
                    message : Joi.string().example('Kiểm tra mail để lấy mã xác nhận')
                }).description('Thành công'),
                [ResponseCode.REQUEST_FAIL]: Joi.object({
                    message: Joi.string().example('Thất bại!').description('Lý do thất bại')
                }).description('Thất bại')
            },
        },
        tags : ['api','Password Action']
    }
}]
