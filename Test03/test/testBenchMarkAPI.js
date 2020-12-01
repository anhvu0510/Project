const apiBenchmark = require('api-benchmark');
const fs = require('fs');
const _ = require('lodash')


const service = {
    server: 'http://127.0.0.1:3000',
};

const dataContent = fs.readFileSync('./test.txt',{encoding : "utf8",flag : 'r'}).split('\r\n')
const routes = {};
dataContent.forEach((item,index) => {
     routes[`COMMENT: ${item} `] = {
        method : 'post',
         route : 'api/comment',
         data: {
             comment : item
         }
    }
})

//
// const routes = {
//     login: {
//         method : 'post',
//         route : 'api/',
//         data: {
//             comment : ''
//         }
//     },
//
// };
// let result;
// const start = Date.now();
// console.time('Test')
// const time = () => apiBenchmark.measure(service, routes,function(err, results) {
//     return new Promise((resolve , reject) => {
//         apiBenchmark.getHtml(results, function(error, html) {
//             if(error){
//                reject(err)
//             }else{
//                 fs.writeFileSync('./test7.html',html,(err) => err)
//             }
//             resolve(Date.now() - start);
//         });
//     })
// });

const benchMark = () => {
    return new Promise((resolve, reject) => {
        apiBenchmark.measure(service, routes,{
            debug : true,
            runMode : 'parallel',
            minSamples: 30
        }, function (err, results) {
            if (err) {
                reject(err);
            }
            apiBenchmark.getHtml( results, (err,html) => {
                if(err){
                    reject(err);
                }
                resolve(html);
            });
        });
    })
};

benchMark().then(html => {
    fs.writeFileSync('./Word-Filter-v2(BenchMark - parallel).html',html,(err) => console.log(err))
})