const mongoose = require('mongoose');
var Joi = require('joi');

const ChannelsMessagesThreadsSchema = new mongoose.Schema({
    message_id: {
        type: String,
        required: true,
        trim: true
    },
    sender_id: {
        type: String,
        required: true,
        trim: true
    },
    channel_id: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    attachment: {
        type: Object,
        default: {
            attached: false,
            files: []
        }
    },
    sent_at: {
        type: Date,
        required: true
    }
});

const channelThreadJoiValidate = function(obj) {
    var schema = Joi.object({
        message_id: Joi.string().required(),
        sender_id: Joi.string().required(),
        channel_id: Joi.string().required(),
        content: Joi.string().required(),
        attachments: Joi.object({
            attached: Joi.boolean(),
            files: Joi.array()
        }),
        sent_at: Joi.date().required()
    })
    return schema.validate(obj);
}

module.exports.ChannelsMessagesThreadsModel = mongoose.model('ChannelsMessagesThreads', ChannelsMessagesThreadsSchema);
module.exports.channelThreadJoiValidate = channelThreadJoiValidate