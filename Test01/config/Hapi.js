module.exports = {
  isActive: true,
  server: {
    port: 3610,
    host: '127.0.0.1'
  },
  plugins: {
    jwt: {
      isActive: true,
      options: {
        inject: ['Default', 'Local'],
        default: {
          strategy: 'Default',
          payload: true
        }
      }
    },
    swagger: {
      isActive: true,
      options: {
        info: {
          title: 'Practice Mecore',
          version: '0.0.1'
        },
        grouping: 'tags',
        expanded: 'list',
        tagsGroupingFilter: (tag) => {
          const _ = require('lodash');
          const VERSION = require('../constants/Version');
          if (!_.includes(_.values(VERSION), tag) && !_.includes(['external', 'internal', 'api'], tag)) {
            return true;
          }
        },
        tags: [],
        securityDefinitions: {
          jwt: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header'
          },
          checksum: {
            type: 'apiKey',
            name: 'Checksum',
            in: 'header'
          }
        },
        security: [
          {
            jwt: [],
            checksum: []
          }
        ]
      }
    },
    apiReply: {
      isActive: true,
      options: {
          handleException: (error, request, reply) => {
          const project = require('..').getInstance();
          const logger = project.log4js.getLogger('system');
          logger.error(error);
          return true;
        },
        message: {
          401: 'Thông tin xác thực không hợp lệ',
          404: 'Api không tồn tại',
          500: 'Dịch vụ đang gặp gián đoạn. Vui lòng quay lại sau'
        }
      }
    },
    apiSecurity: {
      isActive: false,
      options: {
        client: {
          app: {
            publicKey: '-----BEGIN PUBLIC KEY-----\n'
              + 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKWcehEELB4GdQ4cTLLQroLqnD3AhdKi\n'
              + 'wIhTJpAi1XnbfOSrW/Ebw6h1485GOAvuG/OwB+ScsfPJBoNJeNFU6J0CAwEAAQ==\n'
              + '-----END PUBLIC KEY-----',
            privateKey: '-----BEGIN RSA PRIVATE KEY-----\n'
              + 'MIIBPAIBAAJBAKWcehEELB4GdQ4cTLLQroLqnD3AhdKiwIhTJpAi1XnbfOSrW/Eb\n'
              + 'w6h1485GOAvuG/OwB+ScsfPJBoNJeNFU6J0CAwEAAQJBAJSfTrSCqAzyAo59Ox+m\n'
              + 'Q1ZdsYWBhxc2084DwTHM8QN/TZiyF4fbVYtjvyhG8ydJ37CiG7d9FY1smvNG3iDC\n'
              + 'dwECIQDygv2UOuR1ifLTDo4YxOs2cK3+dAUy6s54mSuGwUeo4QIhAK7SiYDyGwGo\n'
              + 'CwqjOdgOsQkJTGoUkDs8MST0MtmPAAs9AiEAjLT1/nBhJ9V/X3f9eF+g/bhJK+8T\n'
              + 'KSTV4WE1wP0Z3+ECIA9E3DWi77DpWG2JbBfu0I+VfFMXkLFbxH8RxQ8zajGRAiEA\n'
              + '8Ly1xJ7UW3up25h9aa9SILBpGqWtJlNQgfVKBoabzsU=\n'
              + '-----END RSA PRIVATE KEY-----'
          }
        }
      }
    },
    apiVersion: {
      isActive: false,
      options: {
        validVersions: [1],
        defaultVersion: 1,
        vendorName: 'me'
      }
    },
    apiResponseTime: {
      isActive: true,
      options: {}
    },
    clientIp: {
      isActive: true,
      options: {}
    },
    i18n: {
      isActive: true,
      options: {}
    }
  }
};

