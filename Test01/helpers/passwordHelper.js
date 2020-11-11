const sha256 = require('sha256')
const salt = sha256('HELLO-WORLD')
const _= require('lodash')
class PasswordHelper {
    //constructor()
    hashPassword(string){
        return sha256.x2(string + salt)
    }
    comparePassword(password,hashPassword){
        if(_.isNil(password)|| _.isNil(hashPassword)){
            throw new Error('[MESSAGE] : Invalid Input')
        }
        return hashPassword === sha256.x2(password + salt);
    }

}
// const test = new PasswordHelper();
// const hash = test.hashPassword('anhvu051')
// console.log('[HASH] :' ,hash)
// console.log('[COMPARE] : ',test.comparePassword('anhvu0510',hash))
// console.log(test.comparePassword())
module.exports = new PasswordHelper();