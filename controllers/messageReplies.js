const messageRepliesController = {}
const _ = require('lodash')
const { ChannelsMessagesThreadsModel, channelThreadJoiValidate } = require('../models/ChannelsMessagesThreads.mongodbSchema')

/**
 * save new reply
 * @param {Object} reply new reply
 */
messageRepliesController.addNewReply = async(reply) => {
    if (channelThreadJoiValidate(reply).error) {
        console.log(channelThreadJoiValidate(reply).error.details[0].message)
        return false;
    }
    let newReply = new ChannelsMessagesThreadsModel(reply)
    return await newReply.save().then(doc => {
        return doc
    }).catch(err => {
        console.log(err)
        return false
    })
}

/**
 * get channel message's replies
 * @param {String} message_id message id
 * @param {String} sender_id sender id
 * @param {String} channel_id channel id
 */
messageRepliesController.getChannelMessageReplies = async(message_id, sender_id, channel_id) => {
    return await ChannelsMessagesThreadsModel.find({
            message_id: message_id,
            sender_id: sender_id,
            channel_id: channel_id
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

module.exports = messageRepliesController