const MeCore = require('mecore');

const instanceName = 'demo';
const meCore = new MeCore(instanceName, __dirname);


meCore.Start();

module.exports.getInstance = () => {
  return MeCore.getInstance(instanceName);
};
