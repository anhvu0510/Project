const Async = require('async')

const myArray = [1,6,4,7,8,3,6,8,3,1,34,6,4];
// console.log('Truoc forEach ne');
// setTimeout(() => {
//     myArray.forEach((item,index) => console.log(`Running ${index} : ${item * 2}`));
// },2)
// console.log('Sau forEach ne');
const cargoQueue = Async.cargoQueue(function(tasks, callback) {
    for (let i=0; i<tasks.length; i++) {
        console.log('hello ' + tasks[i].name);
    }
    callback();
}, 2, 2);

// add some items
cargoQueue.push({name: 'foo'}, function(err) {
    console.log('finished processing foo ');
});
cargoQueue.push({name: 'bar'}, function(err) {
    setTimeout(() =>console.log('finished processing bar in 8 seconds'),8)

});
cargoQueue.push({name: 'baz'}, function(err) {
    console.log('finished processing baz');
});
cargoQueue.push({name: 'boo'}, function(err) {
    setTimeout(() => console.log('finished processing boo in 3 seconds'),2)
});
