const messageController = {};
const _ = require('lodash')
const { ChannelsMessagesJoiValidate, ChannelsMessagesModel } = require('../models/ChannelsMessages.mongodbSchema')
const messageRepliesController = require('../controllers/messageReplies')
const userController = require("./user")
const userProfPicController = require('./userProfilePicture')

/**
 * saves a new channel message
 * @param {Object} message new message
 */
messageController.addMessage = async(message) => {
    if (ChannelsMessagesJoiValidate(message).error) {
        console.log(ChannelsMessagesJoiValidate(message).error.details[0].message)
        return false;
    }
    let newMessage = new ChannelsMessagesModel(message)
    return await newMessage.save().then(doc => {
        return doc
    }).catch(err => {
        console.log(err)
        return false
    })
};


/**
 * delete a channel message
 * @param {String} workspace_id workspace id
 * @param {String} channel_id channel id
 * @param {String} message_id message id
 * @returns Boolean
 */
messageController.deleteMessage= (workspace_id,channel_id,message_id)=>{
    return ChannelsMessagesModel.findOneAndDelete({
        _id: message_id,
        channel_id: channel_id,
        workspace_id: workspace_id
    }).then(deletedMessage=>{
       return messageRepliesController.deleteReplies(message_id, channel_id)
       .then(deletedReply=> {return true})
       .catch(err => {return false})
    }).catch(err => {
        return false
    })
}

/**
 * count channel chat messages
 * @param {String} workspace_id workspace id
 * @param {String} channel_id the channel id
 */
messageController.countMessages = async function(workspace_id, channel_id) {
    return await ChannelsMessagesModel.find({
        workspace_id: workspace_id,
        channel_id: channel_id
    }).countDocuments().then(num => {
        return num;
    }).catch(err => {
        console.log(err);
        return false
    })
}

/**
 * get few latest messages in a channel
 * @param {String} workspace_id workspace id
 * @param {String} channel_id the channel id
 */
messageController.getChannelAllMessages = async(workspace_id, channel_id) => {
    let allSms = []
    return await ChannelsMessagesModel.find({
            workspace_id: workspace_id,
            channel_id: channel_id
        }).sort({ _id: "desc" }).limit(20)
        .then(async(messages) => {
            //get every messages's replies
            for (let index = 0; index < messages.length; index++) {
                let message = _.pick(messages[index], ["_id", "sender_id", "channel_id", "workspace_id", "content", "sent_at", "attachments"])
                await messageRepliesController.getChannelMessageReplies(message._id, message.sender_id, message.channel_id)
                .then(replies => {
                    message.replies = replies
                })
                let sender_info = await userController.getUserById(message.sender_id)
                let sender = sender_info.toObject();
                if(!sender.picture_updated){
                    sender.profile_pic = {
                        updated: false
                    }
                }else{
                    let pic = await userProfPicController.getDocFieldsByUserId(sender._id, {picture: {url: 1}})
                    if(pic){
                        sender.profile_pic = {
                            updated: true,
                            url: pic.picture.url
                        }
                    }
                }
                message.sender_info = _.pick(sender,["full_name","display_name","email","profile_pic", "picture_updated"])
                allSms.push(message)
            }
            // console.log(allSms);
            
            return allSms.reverse();
        }).catch(() => { return false })
}

/**
 * get few channel chat older messages below a given message id
 * @param {String} workspace_id workspace's id
 * @param {String} channel_id channel's id
 * @param {String} last_message_id the message id to be used when fetching messages older than it
 */
messageController.getFewOlderMessages = async(workspace_id, channel_id, last_message_id) => {
    let allSms = []
    return await ChannelsMessagesModel.find({
            workspace_id: workspace_id,
            channel_id: channel_id
        })
        .where('_id').lt(last_message_id)
        .sort({ _id: "desc" }).limit(10)
        .then(async(messages) => {
            //get every messages's replies
            for (let index = 0; index < messages.length; index++) {
                let message = _.pick(messages[index], ["_id", "sender_id", "channel_id", "workspace_id", "content", "sent_at", "attachments"])
                await messageRepliesController.getChannelMessageReplies(message._id, message.sender_id, message.channel_id)
                .then(replies => {
                    message.replies = replies
                })
                let sender_info = await userController.getUserById(message.sender_id)
                let sender = sender_info.toObject();
                if(!sender.picture_updated){
                    sender.profile_pic = {
                        updated: false
                    }
                }else{
                    let pic = await userProfPicController.getDocFieldsByUserId(sender._id, {picture: {url: 1}})
                    if(pic){
                        sender.profile_pic = {
                            updated: true,
                            url: pic.picture.url
                        }
                    }
                }
                message.sender_info = _.pick(sender,["full_name","display_name","email","profile_pic", "picture_updated"])
                allSms.push(message)
            }
            return allSms.reverse();
        }).catch(() => { return false })
}

module.exports = messageController;