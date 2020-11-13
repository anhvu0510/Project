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
    },{
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
    })
}

module.exports = Model;