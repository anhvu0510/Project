const _ = require('lodash');
const Redis = require('ioredis');

const config = {
    host: process.env.REDIS_HOST || process.env.IP || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
};
class CacheHelper {
    constructor(props) {
        this._Client = new Redis(config);
    }
    setCache(key,value,timeout){
        return new Promise((resolve,reject) => {
            let Result;
            if(_.isNil(key) || _.isNil(value)){
                return reject( new Error('Key Error'))
            }
            if(!_.isNil(timeout)){
                Result = this._Client.set(key,JSON.stringify(value),"EX",parseInt(timeout));
            }else {
                Result = this._Client.set(key,JSON.stringify(value));
            }
            Result.then(success => {
                resolve(value)
            }).catch((err) => {
                reject(err)
            })
        })
    }
    async getCathe(key){
        return JSON.parse(await  this._Client.get(key));
    }
    async getTimeOut(key){
        return  await this._Client.call('ttl',key);
    }
    async delCache(key){
        return await this._Client.call('del',key);
    }
}
module.exports = new CacheHelper();