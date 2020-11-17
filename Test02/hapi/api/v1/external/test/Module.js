module.exports = (request, reply) => {
  const payload = request.payload;
  const version = request.pre.apiVersion;
  console.log(version);
  return reply.api({
    test: request.i18n.__('Client IP {{clientIp}}', {
      clientIp: request.clientIp
    })
  }).code(1000);
}
;
