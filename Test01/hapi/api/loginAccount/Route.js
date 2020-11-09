const Module = require('./Module');
const Joi = require('mecore').Joi;
const ResponseCode = require('project/constants/ResponseCode')

module.exports = [{
    method : 'POST',
    path : '/api/login',
    handler : Module,
    options : {
        description : "Đăng Nhập",
        auth : false,
        validate : {
            payload : Joi.object({
                username : Joi.string()
                    .pattern(/^\D[a-zA-Z0-9]{1,}$/)
                    .required()
                    .label('Tên Đăng Nhập')
                    .description('Tên Đăng Nhập'),
                password : Joi.string().required().description('Mật Khẩu'),
            }).options({abortEarly : true,})
        },
        response: {
            status: {
                [ResponseCode.REQUEST_SUCCESS]: Joi.object({}).description('Thành công'),
                [ResponseCode.REQUEST_FAIL]: Joi.object({
                    message: Joi.string().example('Thất bại!').description('Lý do thất bại')
                }).description('Thất bại')
            },
        },


        tags : ['api','Login']
    }
}]
