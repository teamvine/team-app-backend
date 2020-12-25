const mongoose = require('mongoose');
var Joi = require('joi');

const DirectMessagesThreadsSchema = new mongoose.Schema({
    direct_message_id: {
        type: String,
        required: true,
        trim: true
    },
    sender_id: {
        type: String,
        required: true,
        trim: true
    },
    receiver_id: {
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
    attachment: {
        type: Object,
        default: {
            attached: false,
            file_id: ""
        }
    },
    sent_at: {
        type: Date,
        required: true
    }
});

const DirectMessageThreadJoiValidate = function(obj) {
    var schema = Joi.object({
        direct_message_id: Joi.string().required(),
        sender_id: Joi.string().required(),
        receiver_id: Joi.string().required(),
        workspace_id: Joi.string().required(),
        content: Joi.string().required(),
        attachments: Joi.object({
            attached: Joi.boolean(),
            files: Joi.array()
        }),
        sent_at: Joi.date().required()
    })
    return schema.validate(obj);
}

module.exports.DirectMessagesThreadsModel = mongoose.model('DirectMessagesThreads', DirectMessagesThreadsSchema);
module.exports.DirectMessageThreadJoiValidate = DirectMessageThreadJoiValidate