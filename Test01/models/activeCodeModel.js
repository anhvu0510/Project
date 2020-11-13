const Mongoose = require('mecore').Mongoose

const Schema = Mongoose.Schema;

const Model = {
    connection : 'Practice',
    tableName : 'ActiveCode',
    autoIncrement : {
        id :{
            startAt : 1,
            incrementBy : 1,
        }
    },
    attributes : new Schema({
        userID : {
            type: Number,
            required : true
        },
        code : {
            type : String,
            required:true
        },
        status :{
            type: Boolean,
            default : true
        }
    },{
        timestamp : true
    })
}

module.exports = Model;