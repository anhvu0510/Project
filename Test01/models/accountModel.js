const Mongoose = require('mecore').Mongoose

const Schema = Mongoose.Schema;

const Model = {
    connection : 'Practice',
    tableName : 'Account',
    autoIncrement : {
        id :{
            startAt : 1,
            incrementBy : 1,
        }
    },
    attributes : new Schema({
        username : {
            type: String,
            required : true
        },
        password : {
            type : String,
            required:true
        },
        email : {
            type: String,
            required: true
        },
        fullname : {
            type :String,
            required : true
        }
    })
}

module.exports = Model;