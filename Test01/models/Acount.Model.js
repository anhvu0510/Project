const Mongoose = require('mecore').Mongoose

const Schema = Mongoose.Schema;

const Model = {
    connection : 'Practice',
    tableName : 'Account',
    // autoIncrement : {
    //     id :{
    //         startAt : 1,
    //         incrementBy : 1,
    //     }
    // },
    attributes : new Schema({
        clientIP : {
            type : String,
            required: true
        },
        username : {
            type: String,
            required : true
        },
        password : {
            type : String,
        },
        OTP:{
            type: String,
            default : null
        }

    })
}

module.exports = Model;