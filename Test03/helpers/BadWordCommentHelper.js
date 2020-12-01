const _ = require('lodash');
const Axios = require('axios');
const path = require('path')
// const { PathLibrary } = require('project/config/Payme');
const fs = require('fs')

async function loadFile(filePath) {
    let badWords = null;

    try {
        // const getFile = await Axios({
        //   // url: `${PathLibrary}${filePath}`,
        //   url : filePath,
        //   method: 'GET'
        // });
        const data = fs.readFileSync(path.join(__dirname, filePath), {encoding: 'UTF-8', flag: 'r'});
        badWords = data.replace(/^(?=\n)$|^\s*|\s*$|\r\n+/gm, '');
    } catch (error) {
        return false;
    }

    if (_.isNull(badWords)) {
        return true;
    }
    const badWordsArray = badWords.split('\n');
    const badFiters = {};
    for (let i = 0; i < badWordsArray.length; i++) {
        const firstChar = _.toLower(badWordsArray[i][0]);
        const currentBadWord = _.toLower(badWordsArray[i]);
        if (!_.get(badFiters, firstChar, false)) {
            badFiters[firstChar] = {};
        }

        const descent = currentBadWord.split(' ');
        if (descent.length === 1) {
            badFiters[firstChar][currentBadWord] = {end: {}};
            continue;
        }
        delete badFiters[`${firstChar}.${currentBadWord}.end`];
        let pointer = badFiters[firstChar];
        for (let j = 0; j < descent.length; j++) {
            //console.log(_.get(pointer, descent[j], false))
            if (!_.get(pointer, descent[j], false)) {
                pointer[descent[j]] = {};
            }
            if (j === (descent.length - 1)) {
                pointer[descent[j]] = {end: {}};
            }
            pointer = pointer[descent[j]];
        }
    }
    return badFiters;
}

class Helper {

    static badFiters = {};

    async filterBadWordsInSentence(content, path = 'badword.csv') {

        if (_.isEmpty(this.badFiters)) {
            this.badFiters = await loadFile(path);
        }
        const badFiters = this.badFiters;
        // In case of file dont exists
        if (_.isBoolean(badFiters)) {
            return content;
        }
        const contentWords = content.split(' ');

        for (let i = 0; i < contentWords.length; i++) {
            const currentWordLowerCase = _.toLower(contentWords[i]);
            const firstChar = currentWordLowerCase[0];

            let pointer = false;
            if (!(pointer = _.get(badFiters, firstChar, false))) {
                continue;
            }

            let currentPointerString = `${firstChar}`;
            // temp array which contains the index of numbers of content to filter
            const tempArray = [];
            let tempCurrentWordLowerCase = '';
            while (i <= contentWords.length - 1) {
                tempCurrentWordLowerCase = _.toLower(contentWords[i]);
                if (pointer = (_.get(pointer, tempCurrentWordLowerCase, false))) {
                    currentPointerString += `.${tempCurrentWordLowerCase}`;
                    tempArray.push(i);
                    ++i;
                } else {
                    if (!_.isEqual(tempCurrentWordLowerCase, currentWordLowerCase)) {
                        --i;
                    }
                    break;
                }
            }
            console.log({ currentPointerString })
            const previousPointer = currentPointerString.replace(tempCurrentWordLowerCase, '.end');
            if (!_.get(badFiters, `${previousPointer}.end`, false)) {
                continue;
            }

            _.forEach(tempArray, number => {
                contentWords[number] = '***';
            });
        }

        let result = '';
        for (let i = 0; i < contentWords.length; i++) {
            result = i === 0 ? contentWords[i] : result + ' ' + contentWords[i];
        }
        return result;
    }
}

module.exports = new Helper();