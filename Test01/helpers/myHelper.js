const moment = require('moment');
const _ = require('lodash')

class myHelper {
    getTimeFromSecond(seconds) {
        const [hour, minute, second] = _.split(moment.utc(moment
            .duration(seconds, "seconds").asMilliseconds()).format("HH:mm:ss"), ':');
        return {h:hour,m:minute,s:second}
    }

}
// const test = new myHelper();
// const rs = test.getTimeFromSecond(60)
// console.log('[RESULT] :',rs)


module.exports = new myHelper();