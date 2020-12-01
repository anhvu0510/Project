const Module = require('./Module');
const Joi = require('mecore').Joi;
const ResponseCode = require('project/constants/ResponseCode')

module.exports = [{
    method: 'POST',
    path: '/api/comment',
    handler: Module,
    options: {
        description: "Bình Luận",
        auth: false,
        validate: {
            payload: Joi.object({
               comment : Joi.string().required().example('Gửi xiền ăn chơi nè :))')
            })
        },
        response: {
            status: {
                [ResponseCode.REQUEST_SUCCESS]: Joi.object({
                    message: Joi.string()
                        .example('Đăng nhập thành công')
                }).description('Thành công'),
                [ResponseCode.REQUEST_FAIL]: Joi.object({
                    message: Joi.string().example('Th?t b?i!').description('Lý do thất bại')
                }).description('Thất bại')
            },
        },
        tags: ['api']
    }
}]
