const MeCore = require('mecore');

const instanceName = 'Test01';
const meCore = new MeCore(instanceName, __dirname);

meCore. Start();

module.exports.getInstance = () => {
    return MeCore.getInstance(instanceName);
};