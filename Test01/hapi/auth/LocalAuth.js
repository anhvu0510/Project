const AuthenticationConfig = require('./../../config/Authentication');

module.exports = {
  key: AuthenticationConfig.jwtSecretForLocal,
  async validate(decoded, request, reply) {
    if (!decoded.id) {
      return { isValid: false };
    }
    return { isValid: true };
  }
};
