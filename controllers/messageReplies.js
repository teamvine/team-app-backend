const messageRepliesController = {}
const _ = require('lodash')
const { ChannelsMessagesThreadsModel, channelThreadJoiValidate } = require('../models/ChannelsMessagesThreads.mongodbSchema')
const userController = require("./user")

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
 * deletes a channel message replies
 * @param {String} message_id message id
 * @param {String} channel_id channel id
 */
messageRepliesController.deleteReplies= async(message_id,channel_id)=>{
    return ChannelsMessagesThreadsModel.deleteMany({
        message_id: message_id,
        channel_id: channel_id
    }).then(deletedReplies=>{
        return true
    }).catch(err => {
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
        }).then(async (replies) => {
            let all = []
            for (let index = 0; index < replies.length; index++) {
                let reply = _.pick(replies[index], ["_id", "sender_id", "content", "attachments", "sent_at"])
                let sender_info = await userController.getUserById(reply.sender_id)
                reply.sender_info = _.pick(sender_info,["full_name","display_name","email","profile_pic"])
                all.push(reply)
            }
            return all;
        })
        .catch(err => {
            console.log(err)
            return []
        })
}

module.exports = messageRepliesController