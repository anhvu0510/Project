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

detectIMG = async (url) => {
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

        const formData = new FormData();
        let imageURL = undefined;
        try {
             imageURL = await axios({
                url,
                method: 'GET',
                responseType: 'stream'
            })
            formData.append('token',token);
            formData.append('image',imageURL.data);
            console.log({ formData });
        }catch (e) {
            console.log( {error : e});
            return { data: { errorMessage: 'Không thể lấy hình ảnh từ URL' } };
        }
        try {
            const getDataFormFPTAI = await axios({
                url: URL_REQUEST,
                method: 'POST',
                headers: formData.getHeaders(),
                data: formData,
                proxy: {
                    //protocol: 'https',
                    // auth: {
                    //     username: '192.168.05.10',
                    //     password: '@123456789@'
                    // },
                    host: PROXY_SERVER.IP,
                    port: PROXY_SERVER.PORT,
                },
                timeout: 5 * 1000,
            })
            if (getDataFormFPTAI.data.errorCode === 0) {
                let dirSave = './private/upload/';
                const nameFolder = new Date().toLocaleDateString().split('/').join('.');
                const nameIMG = `ID${new Date().getTime()}`
                if (!fs.existsSync(dirSave)) {
                    fs.mkdir(dirSave, (err) => err);
                }
                dirSave = path.join(dirSave, nameFolder);
                if (!fs.existsSync(dirSave)) {
                    fs.mkdir(dirSave, (err) => err)
                }
                const write = fs.createWriteStream(path.join(dirSave,nameIMG));
                imageURL.data.pipe(write)
                    .on('error',() => {console.log('Tải ảnh thất bại')});
            }
            return getDataFormFPTAI;
        } catch (error) {
            //return fake data if request to FPT AI fail
            console.log({ error })
            //fs.unlinkSync(filePath)
            if (error.response && error.response.status === 429) {
                return { data: { errorMessage: 'Quá Số Lần Gửi Yêu Cầu' } };
            }
            return {
                data: { errorMessage: 'Không Thể Kết Nối Đến Proxy Server' }
            };
        }


        // const nameFolder = new Date().toLocaleDateString().split('/').join('.');
        // const nameIMG = `ID${new Date().getTime()}`
        // if (!fs.existsSync(dirSave)) {
        //     fs.mkdir(dirSave, (err) => err);
        // }
        // dirSave = path.join(dirSave, nameFolder);
        // if (!fs.existsSync(dirSave)) {
        //     fs.mkdir(dirSave, (err) => err)
        // }
        // // dirSave = path.join(dirSave,nameFolder);
        //
        // let filePath = undefined;
        // try {
        //     filePath = await downloadImage(url, dirSave, nameIMG)
        // } catch (e) {
        //     return { data: { errorMessage: 'Tải Hình Thất Bại - Thử Lại Sau' } }
        // }
        // if (!filePath) {
        //     return {
        //         data: { errorMessage: 'Url không phải là hình ảnh' }
        //     };
        // }
        // //const Test = fs.createReadStream(__dirname);
        // const Test2 = fs.createReadStream(filePath)
        //     .on('error',() => {
        //         return { data: { errorMessage: 'Lỗi hình ảnh' } };
        //     });
        //
        // const form = new FormData();
        // form.append('token', token);
        // // console.log({ filePath });
        // //form.append('image', fs.createReadStream(filePath));
        // form.append('image', Test2);
        //
        // //form.append('image',fs.createReadStream(path.join(__dirname,'test.jpg')))
        // console.log({ form })
        // try {
        //     const response = await axios({
        //         url: URL_REQUEST,
        //         method: 'POST',
        //         headers: form.getHeaders(),
        //         data: form,
        //         // proxy: {
        //         //     //protocol: 'https',
        //         //     // auth: {
        //         //     //     username: '192.168.05.10',
        //         //     //     password: '@123456789@'
        //         //     // },
        //         //     host: PROXY_SERVER.IP,
        //         //     port: PROXY_SERVER.PORT,
        //         // },
        //         // timeout: 60 * 60,
        //
        //     })
        //     if (response.data.errorCode !== 0) {
        //         fs.unlinkSync(filePath)
        //     }
        //     return response;
        // } catch (error) {
        //     //return fake data if request to FPT AI fail
        //     console.log({ error })
        //     //fs.unlinkSync(filePath)
        //     if (error.response.status === 429) {
        //         return { data: { errorMessage: 'Quá Số Lần Gửi Yêu Cầu' } };
        //     }
        //     return {
        //         data: { errorMessage: 'Không Thể Kết Nối Đến Proxy Server' }
        //     };
        // }
    } catch (error) {
        console.log(error);
        return {
            data: { errorMessage: 'Lỗi không xác định - Thử lại sau' }
        };
    }
}

module.exports = async (request, reply) => {
    const { url } = request.payload;
    const response = await detectIMG(url);
    //console.log({data: response.data})
    if (response.data.errorCode !== 0) {
        return reply.api({ message: response.data.errorMessage }).code(ResCode.REQUEST_FAIL);
    }
    return reply.api({ data: response.data }).code(ResCode.REQUEST_SUCCESS);
};