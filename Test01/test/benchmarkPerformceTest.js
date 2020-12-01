const apiBenchmark = require('api-benchmark');
const fs = require('fs');

const service = {
    server: 'http://127.0.0.1:3610',
};

const routes = {
    login: {
        method : 'post',
        route : 'api/login',
        data: {
            username : 'Usertest01',
            password : 'hellowordld'
        }
    },
    register: {
        method : 'post',
        route : 'api/register',
        data: {
            username: "Usertest07",
            password: "helloword",
            email: "swodogi5277@idcbill.com",
            fullname: "Nguyễn Văn A",
            OTP: ""
        }
    },
    // sendactivecode: {
    //     method : 'post',
    //     route : 'api/send-active-code',
    //     data: {
    //         username : 'Usertest01',
    //     }
    // },
};
let result;
const start = Date.now();
console.time('Test')
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
    console.timeEnd('Test')
    const start = Date.now();
    return new Promise((resolve, reject) => {
        apiBenchmark.measure(service, routes, function (err, results) {
            if (err) {
                reject(err);
            }
            apiBenchmark.getHtml( result, (err,html) => {
                if(err){
                    reject(err);
                }
                console.timeEnd('Test')
                resolve({time : Date.now() - start ,html});
            });
        });
    })
};

benchMark().then(({time,html}) => {
    console.log(time)
})