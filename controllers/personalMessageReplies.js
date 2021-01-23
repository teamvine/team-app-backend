const personalMessageRepliesController = {}
const _ = require('lodash')
const { DirectMessagesThreadsModel, DirectMessageThreadJoiValidate } = require('../models/DirectMessagesThreads.mongodbSchema')
const userController = require("./user")

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
 * deletes a direct chat message replies
 * @param {String} message_id message id
 * @param {String} channel_id channel id
 */
personalMessageRepliesController.deleteReplies= async(direct_message_id,workspace_id)=>{
    return DirectMessagesThreadsModel.deleteMany({
        direct_message_id: direct_message_id,
        workspace_id: workspace_id
    }).then(deletedReplies=>{
        return true
    }).catch(err => {
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
        }).then(async(replies) => {
            let all = []
            for (let index = 0; index < replies.length; index++) {
                let reply = _.pick(replies[index], ["_id", "sender_id", "content", "attachments", "sent_at"])
                let sender_info = await userController.getUserById(reply.sender_id)
                reply.sender_info = _.pick(sender_info,["_id","full_name","display_name","email","profile_pic"])
                all.push(reply)
            }
            return all;
        })
        .catch(err => {
            console.log(err)
            return []
        })
}

module.exports = personalMessageRepliesController