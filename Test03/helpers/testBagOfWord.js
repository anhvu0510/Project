const helpers = require('./BadWordCommentHelper')
const fs = require('fs')
const _ = require('lodash')
const path = require('path')
//const dataContent = fs.readFileSync('./test.txt',{encoding : "utf8",flag : 'r'}).split('\r\n')

// const testBenchWork  = async (content) => {
//     return await helpers.filterBadWordsInSentence(content);
// }

const value1 = 'Hello em là admin Hoàng Sa là của Việt nam nha chú em'
const value2 = 'Mai sinh nhật bác hồ đi quẩy không????';
const value3 = 'haha bức lông concac nha admin thang cho buavaihang bulonkhonganh trai cua em '
const value4 = 'buyoncredit chính phủ chống tham nhũng là những thằng việt nam ngu nhất thế giới con cặc mấy thằng lon óc chó.'
const value5 = 'ditbomay fuckyou socaivu hahaa gietconmemay budit haha'
const value6 = 'thằng chó việt cộng Câm mồm và biến đi!';
const value7 = 'chết đi thằng chó ăn cứt hahaha'
const value8 = 'Việt nam đất nước'

const dictArr = ['thằng óc chó','việt cộng','ngulamconchocaihaha']
//let myString = 'màylà thằng,óc,chó ngu con $nhất@tao%từng thầy đó thằng ngu chó bác hồ hahaha thằng việt cộng của việt nam thằng_óc_chó';
let myString = 'buyoncredit chính phủ chống tham nhũng'






let cleanString = _.join(_.words(myString),' ')

dictArr.forEach((item) => {
   if(cleanString.includes(item)){
       //let tempString = item.split(' ').map(item => item = '***').join(' ');
       const regex = new RegExp(item,'g')
        cleanString = cleanString.replace(regex,_.join(_.words(item).map(item => '*'.repeat(item.length)),' '));
   }
})


async function loadFile(filePath) {
    let badWords = null;

    try {
        const data = fs.readFileSync(path.join(__dirname, filePath), {encoding: 'UTF-8', flag: 'r'});
        badWords = data.replace(/^(?=\n)$|^\s*|\s*$|\r\n+/gm, '');
    } catch (error) {
        return false;
    }

    if (_.isNull(badWords)) {
        return true;
    }

    const badFiters = {};
    const badWordsArray = _.split(badWords,'\n');
    badWordsArray.forEach(item => {
        const firstCharacter = _.toLower(item[0]);
        const cleanItem = _.join(_.words(_.toLower(item)),' ')

        if(!_.get(badFiters,firstCharacter,false)) {
            badFiters[firstCharacter] = [cleanItem]
        }
        if(!badFiters[firstCharacter].includes(cleanItem)){
            badFiters[firstCharacter].push(cleanItem)
        }
    })

    return badFiters;
}

const filterSentence = (dict,content) => {
    dict.forEach(item => {
       if(content.includes(item)){
           const regex = new RegExp(item,'g');
           content = content.replace(regex,_.join(_.words(item).map(item => '***'),' '));
       }
    })
    return content;
}

// const data = loadFile('badword.csv').then(data => console.log(data['a']));
const arrLetter = [...new Set(_.words(myString).map(item => item[0]))];

test = async(content,path ='badword.csv') => {
    const data = await loadFile(path);
    let cleanContent = _.toLower(_.join(_.words(content), ' ')) + '.';
    const arrLetter = [...new Set(_.words(cleanContent).map(item => item[0]))];
    let dict = [];
    arrLetter.forEach( item => {
        const value = data[item];
        dict = [...dict,...value];
    })

    dict.forEach(item => {
        let pattent = `(${item})(?=\\s|\\.)`;
        const regex = new RegExp(pattent,'g');
        cleanContent = cleanContent.replace(regex,_.join(_.words(item).map(item => '*'.repeat(item.length)),' '));
    })



    return cleanContent;
}

// console.time('ME')
// test(value4).then(data => {
//     let cleanContent = _.toLower(_.join(_.words(value4), ' ')) + '.';
//     console.log( { data })
//     data.forEach(item => {
//         let pattent = `(${item})(?=\\s|\\.)`;
//         console.log(pattent)
//         const regex = new RegExp(pattent,'g');
//         cleanContent = cleanContent.replace(regex,_.join(_.words(item).map(item => '*'.repeat(item.length)),' '));
//     })
//     console.timeEnd('ME')
//     console.log({ cleanContent })
// })



//removeUnicode = (content) => content.replace(/[^0-9a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/gi, '');


//
// const cleanAccents = (str) => {
//     str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
//     str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
//     str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
//     str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
//     str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
//     str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
//     str = str.replace(/đ/g, "d");
//     str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
//     str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
//     str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
//     str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
//     str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
//     str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
//     str = str.replace(/Đ/g, "D");
//     // Combining Diacritical Marks
//     str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // huyền, sắc, hỏi, ngã, nặng
//     str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // mũ â (ê), mũ ă, mũ ơ (ư)
//
//     return str;
// }
//




//console.log({ data : filterSentence(dictArr,myString)})

// test(value1).then(data => console.log(data));
// test(value2).then(data => console.log(data));
// test(value3).then(data => console.log(data));
// test(value4).then(data => console.log(data));
// test(value5).then(data => console.log(data));
// test(value6).then(data => console.log(data));
// test(value7).then(data => console.log(data));
// test(value8).then(data => console.log(data));




// helpers.filterBadWordsInSentence(value8).then( data => {
//     console.log({ input : value8,  output : data })
// })
//
//
//

console.time('ME')
test(value5).then(data => {
    console.timeEnd('ME');
    console.log( { input : value5 , output : data})
})


console.time('YOU')
helpers.filterBadWordsInSentence(value5).then( data => {
    console.timeEnd('YOU')
    console.log({ input : value5, output : data })
})
//
// helpers.filterBadWordsInSentence(value1).then( data => {
//     console.log({ input : value1,  output : data })
// })
//
// helpers.filterBadWordsInSentence(value2).then( data => {
//     console.log({ input : value2,  output : data })
// })
//
// helpers.filterBadWordsInSentence(value3).then( data => {
//     console.log({ input : value3,  output : data })
// })
//
// helpers.filterBadWordsInSentence(value4).then( data => {
//     console.log({ input : value4,  output : data })
// })
//
// helpers.filterBadWordsInSentence(value5).then( data => {
//     console.log({ input : value5,  output : data })
// })
//
// helpers.filterBadWordsInSentence(value6).then( data => {
//     console.log({ input : value6,  output : data })
// })


// dataContent.forEach(async (value,index) => {
//    dataContent.forEach((item,index) => {
//        //console.time(`Running: ${index + 1}`);
//        helpers.filterBadWordsInSentence(item).then( data => {
//            //console.timeEnd(`Running: ${index + 1}`);
//            console.log({ input : item,  output : data })
//        })
//    })
//
// })