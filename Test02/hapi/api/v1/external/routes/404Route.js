const Joi = require('mecore').Joi;

const ResponseCode = require('../../../../../config/ResponseCode');

module.exports = [
  {
    method: '*',
    path: '/{any*}',
    handler(request, reply) {
      console.log(request.method);
      console.log(request.headers);
      console.log(request.payload);
      return reply.response('404').code(200);
    },
    options: {
      auth: false,
      validate: {

      },
      tags: [],
      response: { 
        status: {
          
        }
      }
    }
  }
];
