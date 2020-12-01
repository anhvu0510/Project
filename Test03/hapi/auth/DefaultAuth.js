module.exports = {
  key: '123456',
  async validate(decoded, request, reply) {
    return { isValid: true };
  }
};
