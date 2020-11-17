const Joi = require('mecore').Joi;

const ResponseCode = require('../../../../../config/ResponseCode');

module.exports = [
  {
    method: 'POST',
    path: '/v1/test',
    handler(request, reply) {
      const payload = request.payload;
      return reply.api({
        test: request.i18n.__('Client IP {{clientIp}}', {
          clientIp: request.clientIp
        })
      }).code(1000);
    },
    options: {
      // auth: 'Local',
      validate: {
        payload: Joi.object({
          username: Joi.string().min(1).max(20).example('11').description('test')
        }).label('PAYLOAD_TEST')
      },
      tags: ['api', 'internal', 'v1'],
      response: { 
        status: {
          [ResponseCode.REQUEST_SUCCESS]: Joi.object({
            test: Joi.string()
          }).label('TEST_SUCCESS')
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/v2/test',
    handler(request, reply) {
      const payload = request.payload;
      return reply.api({
        ip: request.i18n.__('Client IP {{clientIp}}', {
          clientIp: request.clientIp
        })
      }).code(1000);
    },
    options: {
      // auth: 'Local',
      validate: {
        payload: Joi.object({
          username: Joi.string().min(1).max(20).example('11').description('test')
        }).label('PAYLOAD_TEST')
      },
      tags: ['api', 'external-v2'],
      response: { 
        status: {
          [ResponseCode.REQUEST_SUCCESS]: Joi.object({
            ip: Joi.string()
          }).label('TEST_SUCCESS')
        }
      }
    }
  }
];
