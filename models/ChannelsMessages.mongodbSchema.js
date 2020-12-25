const mongoose = require('mongoose');
var Joi = require('joi');

const ChannelsMessagesSchema = new mongoose.Schema({
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
    workspace_id: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    attachments: {
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

function ChannelsMessagesJoiValidate(obj) {
    var schema = Joi.object({
        sender_id: Joi.string().required(),
        channel_id: Joi.string().required(),
        workspace_id: Joi.string().required(),
        content: Joi.string().required(),
        attachments: Joi.object({
            attached: Joi.boolean(),
            files: Joi.array()
        }),
        sent_at: Joi.date().required(),
    })
    return schema.validate(obj)
}

module.exports.ChannelsMessagesModel = mongoose.model('ChannelsMessages', ChannelsMessagesSchema);
module.exports.ChannelsMessagesJoiValidate = ChannelsMessagesJoiValidate