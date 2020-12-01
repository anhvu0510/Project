const _ = require('lodash')
const ResCode = require('../../../constants/ResponseCode')
const helper = require('../../../helpers/BadWordCommentHelper')


module.exports = async (request, reply) => {
    try {
        const {comment} = request.payload
        const data = await helper.filterBadWordsInSentence(comment)
        return reply.api({message : data}).code(ResCode.REQUEST_SUCCESS)
    } catch (e) {
        throw (e);
    }
}
