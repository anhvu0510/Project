const puppeteer = require('puppeteer');
const axios = require('axios').default;
const fs = require('fs');
const ResCode = require('project/constants/ResponseCode')
const FormData = require('form-data');


const PROXY_SERVER = {
    IP: '139.162.24.32',
    PORT: 9999,
};

// const PROXY_SERVER = {
//     IP: '31.220.33.13',
//     PORT: 1212,
// };

// const PROXY_SERVER = {
//     IP: '185.236.202.135',
//     PORT: 3128,
// };
// const PROXY_SERVER = {
//     IP: '102.129.133.60',
//     PORT: 3128,
// };


// const PROXY_SERVER = {
//     IP: '200.73.128.176',
//      PORT: 3128,
// };

//185.236.202.135:3128
//1.70.67.28:9999
//223.242.224.240:9999
//222.90.110.194:8080

const URL_BASE = 'https://fpt.ai/vision-en';
const URL_REQUEST = 'https://demo-backend.openfpt.vn/vision/cmt';

downloadImage = async (url, dirSave, nameIMG) => {
    //const path = Path.resolve(DIR_PATH, 'code.jpg')
    try {
        if (url.match(/\.(jpeg|jpg|gif|png)$/) === null) {
            return false;
        }
        const filePath = `${dirSave}/${nameIMG}.jpg`
        const writer = fs.createWriteStream(filePath)
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        })
        response.data.pipe(writer)
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve(filePath))
            writer.on('error', reject)
        })
    } catch (error) {
        //console.log(error);
    }
}
detectIMG = async (url) => {
    try {
        let dirSave = './private/upload';
        const browser = await puppeteer.launch({
            headless: true,
            // args: [
            //     `--proxy-server=${PROXY_SERVER.IP}:${PROXY_SERVER.PORT}`]
        });
        const page = await browser.newPage();
        await page.goto(URL_BASE);
        const getToken = () => {
            return page.evaluate(async () => {
                return await new Promise(resolve => {
                    grecaptcha.ready(async function () {
                        const token = await grecaptcha.execute('6Lc1vJQUAAAAAGktFIQ-6hbHTVQXHWF174WTMjDE', {action: 'vision'});
                        resolve(token);
                    });
                })
            })
        }
        const token = await getToken();

        await browser.close();

        const nameFolder = new Date().toLocaleDateString().split('/').join('.');
        const nameIMG = `ID${new Date().getTime()}`
        if (!fs.existsSync(`${dirSave}/${nameFolder}`)) {
            fs.mkdirSync(`${dirSave}/${nameFolder}/`)
        }
        dirSave = dirSave + '/' + nameFolder;
        let filePath = undefined;
        try {
            filePath = await downloadImage(url, dirSave, nameIMG)
        } catch (e) {
            return {data: {errorMessage: 'Tải Hình Thất Bại - Thử Lại Sau'}}
        }
        if (!filePath) {
            return {
                data: {errorMessage: 'Url không phải là hình ảnh'}
            };
        }

        const form = new FormData();
        form.append('token', token);
        // console.log({ filePath });
        form.append('image', fs.createReadStream(filePath));
        console.log( { form })
        try {
            const response = await axios({
                url: URL_REQUEST,
                method: 'POST',
                headers: form.getHeaders(),
                data: form,
                proxy: {
                    //protocol: 'https',
                    // auth: {
                    //     username: '192.168.05.10',
                    //     password: '@123456789@'
                    // },
                    host: PROXY_SERVER.IP,
                    port: PROXY_SERVER.PORT,
                },
                timeout: 60 * 60,
               
            })
            if (response.data.errorCode !== 0) {
                fs.unlinkSync(filePath)
            }
            return response;
        } catch (error) {
            //return fake data if request to FPT AI fail
            fs.unlinkSync(filePath)
            return {
                data: {errorMessage: 'Không Thể Kết Nối Đến Proxy Server'}
            };
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = async (request, reply) => {
    const {url} = request.payload;
    const response = await detectIMG(url);
    //console.log({data: response.data})
    if (response.data.errorCode !== 0) {
        return reply.api({message: response.data.errorMessage}).code(ResCode.REQUEST_FAIL);
    }
    return reply.api({data: response.data}).code(ResCode.REQUEST_SUCCESS);
};