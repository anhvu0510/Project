const puppeteer = require('puppeteer');
const axios = require('axios').default;
const fs = require('fs');
const ResCode = require('project/constants/ResponseCode')
const path = require('path');
const _= require('lodash');
const FormData = require('form-data');


// const PROXY_SERVER = {
//     IP: '139.162.24.32',
//     PORT: 9999,
// };

// const PROXY_SERVER = {
//     IP: '31.220.33.13',
//     PORT: 1212,
// };

const PROXY_SERVER = {
    IP: '185.236.202.135',
    PORT: 3128,
};
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
const URL_PROXY_BOT = 'https://proxybot.io/api/v1/rDwN8lR30lZFuz8thXRCYEC0DLO2/post?url='
downloadImage = async (url, dirSave, nameIMG) => {
    //const path = Path.resolve(DIR_PATH, 'code.jpg')
    try {
        if (url.match(/\.(jpeg|jpg|gif|png)$/) === null) {
            return false;
        }
        const filePath = `${path.join(dirSave, nameIMG)}.jpg`
        //const filePath = 'ANHVU.jpeg'
        const writer = fs.createWriteStream(filePath,{flags : 'w'})
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        })
        response.data.pipe(writer)
        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log('Tải Ảnh Thành Công');
                resolve(filePath);
                //resolve(response)
            })
            writer.on('error', reject)
        })
    } catch (error) {
        //console.log(error);
    }
}
downloadImage_v2 = (source,dirSave,nameIMG) => {
    const nameFolder = new Date().toLocaleDateString().split('/').join('.');
    nameIMG = `${nameIMG}${new Date().getTime()}.jpg`

    if (!fs.existsSync(dirSave)) {
        fs.mkdir(dirSave, (err) => err);
    }
    dirSave = path.join(dirSave, nameFolder);
    if (!fs.existsSync(dirSave)) {
        fs.mkdir(dirSave, (err) => err)
    }
    dirSave = path.join(dirSave,`${nameIMG}`);
    source.data.pipe(fs.createWriteStream(dirSave))
        .on('error',() => {console.log('Đã tải hình ảnh')});
    return dirSave;
}
detectIMG = async (url) => {
    const response = {
        code : ResCode.REQUEST_FAIL,
        message : ''
    }

    try {
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
                        const token = await grecaptcha.execute('6Lc1vJQUAAAAAGktFIQ-6hbHTVQXHWF174WTMjDE', { action: 'vision' });
                        resolve(token);
                    });
                })
            })
        }
        const token = await getToken();
        await browser.close();
        let imageURL = undefined;
        try {
              imageURL = await axios({
                url,
                method: 'GET',
                responseType: 'stream'
            })
        }catch (e) {
            //console.log( {error : e});
            response['message'] = 'Không thể lấy ảnh từ URL';
            return response;
        }

        let dirSave = './private/upload/';
        let filePath = undefined;
        try {
            const formData = new FormData();
            formData.append('token',token);
            formData.append('image',imageURL.data);

            filePath = downloadImage_v2(imageURL,dirSave,'CMND');
            const getDataFormFPTAI =  await axios({
                url: URL_REQUEST,
                method: 'POST',
                headers: formData.getHeaders(),
                data: formData,
                // proxy: {
                //     //protocol: 'https',
                //     // auth: {
                //     //     username: '192.168.05.10',
                //     //     password: '@123456789@'
                //     // },
                //     host: PROXY_SERVER.IP,
                //     port: PROXY_SERVER.PORT,
                // },
                //timeout: 50 * 1000,
            })
            if(getDataFormFPTAI.data.error === 0){
                response.code = ResCode.REQUEST_SUCCESS;
                response.message = 'Thông tin';
                response.data = getDataFormFPTAI.data.data;
                return  response;
            }
            fs.unlinkSync(filePath);
            response.message = 'Không thể lấy thông tin hình ảnh';
            return response;
        } catch (error) {
            //return fake data if request to FPT AI fail
            //console.log({ error })
            fs.unlinkSync(filePath)
            if (error.response && error.response.status === 429) {
                response.message = 'Quá số lần gửi request';
                return response;
            }
            response.message = 'Không thể kết nối đến Proxy Server';
            return response;
        }
    } catch (error) {
        //console.log(error);
        response.message = 'Lỗi không xác định';
        return response;
    }
}

module.exports = async (request, reply) => {
    const { url } = request.payload;
    const response = await detectIMG(url);
    //console.log({data: response.data})
    if (response.code === ResCode.REQUEST_FAIL) {
        return reply.api({ message: response.message }).code(response.code);
    }
    return reply.api({data : response.data}).code(response.code);
};