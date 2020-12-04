    const Module = require('./Module');
    const Joi = require('mecore').Joi;
    const ResponseCode = require('project/constants/ResponseCode')

    module.exports = [{
        method: 'POST',
        path: '/api/detect-image',
        handler: Module,
        options: {
            description: "Phân giải ảnh",
            auth: false,
            validate: {
                payload: Joi.object({
                    url: Joi.string().required().example('https://s3.storage.2banh.vn/image/2016/03/khi-di-lam-cmnd-12-so-phai-mac-ao-co-co-nhe-moi-nguoi-luu-y-dieu-nay-27-1459216122-56f9defa3766f.jpg'),
                })
            },
            response: {
                status: {
                    [ResponseCode.REQUEST_SUCCESS]: Joi.object({
                        message : Joi.string(),
                        data : Joi.array()
                    }).description('Thành công'),
                    [ResponseCode.REQUEST_FAIL]: Joi.object({
                        message : Joi.string().example('Lý Do Thất Bại'),
                    }).description('Thất bại')
                },
            },
            tags: ['api', 'Login']
        }
    }]
