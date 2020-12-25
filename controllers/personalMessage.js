const personalMessageController = {};
const _ = require('lodash')
const { DirectMessagesModel, DirectMessagesJoiValidate } = require('../models/DirectMessages.mongodbSchema')
const personalMessageRepliesController = require('../controllers/personalMessageReplies')


/**
 * save a new message
 * @param {Object} message 
 */
personalMessageController.addMessage = async(message) => {
    if (DirectMessagesJoiValidate(message).error) {
        console.log(DirectMessagesJoiValidate(message).error.details[0].message)
        return false;
    }
    let newMessage = new DirectMessagesModel(message)
    return await newMessage.save().then(doc => {
        return doc
    }).catch(err => {
        console.log(err)
        return false
    })
};

/**
 * count direct chat messages
 * @param {String} workspace_id workspace id
 * @param {String} user_id requesting user's id
 * @param {String} partner_id partner's id
 */
personalMessageController.countMessages = async function(workspace_id, user_id, partner_id) {
    return await DirectMessagesModel.find()
        .or([
            { workspace_id: workspace_id, sender_id: user_id, receiver_id: partner_id },
            { workspace_id: workspace_id, sender_id: partner_id, receiver_id: user_id }
        ]).countDocuments().then(num => {
            return num;
        }).catch(err => {
            console.log(err);
            return false
        })
}

/**
 * get few latest direct chat messages
 * @param {String} workspace_id workspace id
 * @param {String} user_id requesting user's id
 * @param {String} partner_id partner's id
 */
personalMessageController.getPersonalChatMessages = async(workspace_id, user_id, partner_id) => {
    let allSms = []
    return await DirectMessagesModel.find()
        .or([
            { workspace_id: workspace_id, sender_id: user_id, receiver_id: partner_id },
            { workspace_id: workspace_id, sender_id: partner_id, receiver_id: user_id }
        ]).sort({ _id: "desc" }).limit(20)
        .then(async(messages) => {
            //get every messages's replies
            for (let index = 0; index < messages.length; index++) {
                let message = _.pick(messages[index], ["_id", "sender_id", "receiver_id", "workspace_id", "content", "sent_at", "attachments"])
                await personalMessageRepliesController.getPersonalMessageReplies(message._id, message.workspace_id)
                    .then(replies => {
                        message.replies = replies
                    })
                allSms.push(message)
            }
            return allSms.reverse();
        }).catch(() => { return false })
};

/**
 * get few direct chat older messages below a given message id
 * @param {String} workspace_id workspace's id
 * @param {String} user_id requesting user's id
 * @param {String} partner_id partner's id
 * @param {String} last_message_id the message id to be used when fetching messages older than it
 */
personalMessageController.getFewOlderMessages = async(workspace_id, user_id, partner_id, last_message_id) => {
    let allSms = []
    return await DirectMessagesModel.find()
        .or([
            { workspace_id: workspace_id, sender_id: user_id, receiver_id: partner_id },
            { workspace_id: workspace_id, sender_id: partner_id, receiver_id: user_id }
        ])
        .where('_id').lt(last_message_id)
        .sort({ _id: "desc" }).limit(10)
        .then(async(messages) => {
            //get every messages's replies
            for (let index = 0; index < messages.length; index++) {
                let message = _.pick(messages[index], ["_id", "sender_id", "receiver_id", "workspace_id", "content", "sent_at", "attachments"])
                await personalMessageRepliesController.getPersonalMessageReplies(message._id, message.workspace_id)
                    .then(replies => {
                        message.replies = replies
                    })
                allSms.push(message)
            }
            return allSms.reverse();
        }).catch(() => { return false })
}

module.exports = personalMessageController;