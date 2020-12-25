const personalMessageRepliesController = {}
const _ = require('lodash')
const { DirectMessagesThreadsModel, DirectMessageThreadJoiValidate } = require('../models/DirectMessagesThreads.mongodbSchema')

/**
 * save new reply
 * @param {Object} reply new reply
 */
personalMessageRepliesController.addNewReply = async(reply) => {
    if (DirectMessageThreadJoiValidate(reply).error) {
        console.log(DirectMessageThreadJoiValidate(reply).error.details[0].message)
        return false;
    }
    let newReply = new DirectMessagesThreadsModel(reply)
    return await newReply.save().then(doc => {
        return doc
    }).catch(err => {
        console.log(err)
        return false
    })
}

/**
 * get personal message's all replies
 * @param {String} direct_message_id direct message_id
 * @param {String} workspace_id workspace_id
 */
personalMessageRepliesController.getPersonalMessageReplies = async(direct_message_id, workspace_id) => {
    return await DirectMessagesThreadsModel.find({
            direct_message_id: direct_message_id,
            workspace_id: workspace_id
        }).then(replies => {
            let all = []
            for (let index = 0; index < replies.length; index++) {
                all.push(_.pick(replies[index], ["_id", "sender_id", "content", "attachments", "sent_at"]))
            }
            return all;
        })
        .catch(err => {
            console.log(err)
            return []
        })
}

module.exports = personalMessageRepliesController