const Schema = require('mecore').Mongoose.Schema;

const Model = {
  connection: 'default',
  tableName: 'Test',
  autoIncrement: {
    id: {
      startAt: 1,
      incrementBy: 1
    }
  },
  attributes: new Schema({
    description: {
      type: String
    }
  }, {
    timestamps: true
  })
};

module.exports = Model;
