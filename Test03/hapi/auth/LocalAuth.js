module.exports = {
  key: '123456',
  async validate(decoded, request, reply) {
    console.log('dawsfdasfa',decoded)
    if (!decoded.id) {
      return { isValid: false };
    }    
    return { isValid: true };
  }
};
