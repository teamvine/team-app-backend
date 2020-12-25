const mongoose = require('mongoose');
var Joi = require('joi');

const DirectMessagesSchema = new mongoose.Schema({
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
    attachments: {
        type: Object,
        default: {
            attached: false,
            files: new Array(0)
        }
    },
    sent_at: {
        type: Date,
        required: true
    }
});

function DirectMessagesJoiValidate(obj) {
    var schema = Joi.object({
        sender_id: Joi.string().required(),
        receiver_id: Joi.string().required(),
        workspace_id: Joi.string().required(),
        content: Joi.string().required(),
        attachments: Joi.object({
            attached: Joi.boolean(),
            files: Joi.array()
        }),
        sent_at: Joi.date().required(),
    })
    return schema.validate(obj);
}

module.exports.DirectMessagesModel = mongoose.model('DirectMessages', DirectMessagesSchema);
module.exports.DirectMessagesJoiValidate = DirectMessagesJoiValidate