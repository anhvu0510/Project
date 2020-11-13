const moment = require('moment');
const _ = require('lodash')

class myHelper {
    getTimeFromSecond(seconds) {
        const [hour, minute, second] = _.split(moment.utc(moment
            .duration(seconds, "seconds").asMilliseconds()).format("HH:mm:ss"), ':');
        return {h:hour,m:minute,s:second}
    }
    randomText = (length) => {
        let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        return result;
    }

}
// const test = new myHelper();
// const rs = test.getTimeFromSecond(60)
// console.log('[RESULT] :',rs)


module.exports = new myHelper();