module.exports = {
  Practice: {
    // uri: 'mongodb://203.162.80.27:27017/pg_payme_vn',
    uri: 'mongodb://127.0.0.1:27017/demo',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    }
  }
};

// module.exports = {
//   default: {
//     uri: 'mongodb://localhost:27017/test',
//     options: {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       useFindAndModify: false,
//       useCreateIndex: true
//     }
//   },
//   common: {
//     uri: 'mongodb://localhost:27017/test1',
//     options: {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       useFindAndModify: false,
//       useCreateIndex: true
//     }
//   }
// };