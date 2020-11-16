const AuthenticationConfig = require('project/config/Authentication');

module.exports = {
  key: AuthenticationConfig.jwtSecretKey,
  async validate(decoded, request, reply) {
    if (!decoded.id) {
      return { isValid: false };
    }
    return { isValid: true };
  }
};
