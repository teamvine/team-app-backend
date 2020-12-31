const mongoose = require('mongoose');
var Joi = require('joi');

const ChannelsMembersSchema = new mongoose.Schema({
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
    gen: {
        type: Boolean,
        required: true,
        default: false
    },
    members: {
        type: Array,
        required: true
    }
});

ChannelsMembersSchema.methods.joiValidate = function(obj) {
    var schema = Joi.object({
        channel_id: Joi.string().required(),
        workspace_id: Joi.string().required(),
        members: Joi.array().required()
    })
    return schema.validate(obj);
}

module.exports = mongoose.model('ChannelsMembers', ChannelsMembersSchema);