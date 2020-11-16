const _ = require('lodash')
const Async = require('async');
const sendMail = require('./mailHelper')
// const stringTest = 'La Anh Vu';
// const test2 = [{name : 'La Anh Vu', age : 10,country : 'Da Lat'}]
// const rvString = [...stringTest].reverse().join('');
//
// console.table(test2)
// console.log(test2)

//
// const users = [
//     { 'user': 'barney', 'age': 36, 'active': true },
//     { 'user': 'fred',   'age': 40, 'active': false }
// ];
// console.table(_.filter(users, ({age}) => _.gte(age,38)))
//
// const strTest01 = 1
// const strTest02 = 1
//
// console.log(_.isEqual(strTest01,strTest02))


// create a queue object with concurrency 2
// async function main() {
//     let q = Async.queue(function (task, callback) {
//         console.log('Running Task ' + task.name)
//         sendMail.SendMailActive(task.to, task.subject, task.obj)
//             .then(info => {
//                 callback(info)
//             })
//     }, 1);
//
// // assign a callback
//     q.drain(function () {
//         const a = 1;
//         console.log('all items have been processed');
//     });
//
//     q.push({
//         name: 'Send mail',
//         to: 'laanhvu99@gmail.com',
//         subject: 'Test Semd Mail',
//         obj: {
//             content : 'Hello Wordl'
//         }
//     }, function (result) {
//         console.log('[RESULT CALL BACK] >>>', result)
//     })

// or await the end
//     await q.drain()

// assign an error callback
//     q.error(function(err, task) {
//         console.error('task experienced an error');
//     });


// callback is optional
//     q.push({name: 'bar'},function (err,data) {
//         console.log('Bar >>>',data)
//     });

// add some items to the queue (batch-wise)
//     q.push([{name: 'baz'},{name: 'bay'},{name: 'bax'}], function(err) {
//         console.log('finished processing item');
//     });

// add some items to the front of the queue
//     q.unshift({name: 'bar'}, function (err) {
//         console.log('finished processing bar');
//     });
//     console.log('da vao main')
//}

// main()
// for (let i = 0 ; i < 10 ; i++){
//     console.log(i)
// }

// sendMail.SendMailActiveQueue({
//         to: 'laanhvu99@gmail.com',
//         sub: 'Test Send Mail',
//         obj : 'HELLO WORLD'
// },1,(info) => {
//         console.log(info)
// })

console.log('Running.....')
