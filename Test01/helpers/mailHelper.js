const Email = require("nodemailer");
const Async = require('async')

const EMAIL_FROM = 'temp.mail.1760467@gmail.com'
const PASSWORD_FROM = '@1234@6789@'


const _transporter = Email.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: EMAIL_FROM,
        pass: PASSWORD_FROM
    }
})

class MailHelper {
    SendMailActive(to, subject, obj) {
        return new Promise((resolve, reject) => {
            _transporter.sendMail({
                from: `${EMAIL_FROM}`,
                to,
                subject,
                text: `Active Code : ${obj.content}`
            }, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res)
                }
            })
        })

    }

    // SendMailActiveQueue(task, concurrency,callback) {
    //      Async.queue(async (task, callback) => {
    //          const rs = await this.SendMailActive(task.to, task.subject, task.obj)
    //          callback(rs)
    //     }, concurrency)
    // }
}
module.exports = new MailHelper();
// console.log('========== Test Send Mail Helper =================');
// const test = new MailHelper();
// const rs = test.SendMailActive('sodogi5277@idcbill.com','Active Code Reset Password',{content :'adeAmj',time :30}).then();
//
// console.log(rs)
//
// console.log('========== ===== END TEST ===== =================');

