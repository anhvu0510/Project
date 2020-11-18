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
            password : 'hellowordl'
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
    sendactivecode: {
        method : 'post',
        route : 'api/send-active-code',
        data: {
            username : 'Usertest01',
        }
    },
};

apiBenchmark.measure(service, routes, {runMode :'parallel'},function(err, results) {
    console.log(results.server['login'])
    apiBenchmark.getHtml(results, function(error, html) {
       if(error){
           console.log({error})
       }else{
           fs.writeFileSync('./test3.html',html,(err) => err)
       }

        // now save it yourself to a file and enjoy
    });
});