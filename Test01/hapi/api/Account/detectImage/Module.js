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
//     IP: '115.75.1.184',
//     PORT: 8118,
// };
//185.236.202.135:3128
//1.70.67.28:9999
//223.242.224.240:9999
//222.90.110.194:8080

const URL_BASE = 'https://fpt.ai/vision-en';
const URL_REQUEST = 'https://demo-backend.openfpt.vn/vision/cmt';
const DIR_PATH = './private/upload';

//const URL = `https://proxybot.io/api/v1/rDwN8lR30lZFuz8thXRCYEC0DLO2?geolocation_code=eu&url=${URL_BASE}`

async function downloadImage(url, name) {
    //const path = Path.resolve(DIR_PATH, 'code.jpg')
    try {
        const filePath = `${DIR_PATH}/${name}.jpg`
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
        console.log(error);
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


        //await page.setRequestInterception(true);
        // await page.setDefaultNavigationTimeout(0);
        // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
        // await page.setExtraHTTPHeaders({
        //     'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
        // });

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
        console.log({ token })

        await browser.close();
        const form = new FormData();
        const filePath = await downloadImage(url, 'img02')
        form.append('token', token);
        //console.log({ filePath });
        form.append('image', fs.createReadStream(filePath));

        console.log( { "ANHVU" : form });

        try {
            const response =  await axios.post(URL_REQUEST, form, {
                headers: form.getHeaders(),
                proxy: {
                    host: PROXY_SERVER.IP,
                    port: PROXY_SERVER.PORT,
                }
            });

         return response;
        } catch (error) {
            //return fake data if request to FPT AI fail
            console.log( error )
            return {
                data: { errorMessage : 'Không Thể Kết Nối Đến Proxy Server'}
            };
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = async (request, reply) => {
    const {url} = request.payload;
    const response = await detectIMG(url);
    console.log({data: response.data})
    if (response.data.errorCode !== 0) {
        return reply.api({message: response.data.errorMessage}).code(ResCode.REQUEST_FAIL);
    }
    return reply.api({data: response.data}).code(ResCode.REQUEST_SUCCESS);
};