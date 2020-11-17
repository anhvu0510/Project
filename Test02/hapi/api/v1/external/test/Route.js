const Joi = require('mecore').Joi;

const ResponseCode = require('../../../../../config/ResponseCode');

module.exports = [
  {
    method: 'POST',
    path: '/v1/testSecurity',
    handler: require('./Module'),
    options: {
      // auth: {  
      //   strategy: 'DefaultWithPayload',
      //   payload: true
      // },
      auth: false,
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
  }
];
