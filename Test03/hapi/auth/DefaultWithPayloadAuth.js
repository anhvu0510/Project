const Boom = require('boom');

module.exports = {
  key: '123456',
  async validate(decoded, request, reply) {
    console.log('222222222222222222222');
    if (!decoded.id) {
      return { isValid: false };
    }    
    return { isValid: true };
  },
  async payloadFunc(request, reply) {
    console.log(request.payload, request.auth.credentials, request.getPayloadDecrypt(request));
    // throw Boom.unauthorized(request.__('Thông tin xác thực không hợp lệ'));
    return reply.continue;
  }
};
