const mongoose = require('mongoose');
var Joi = require('joi');

const ChannelsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    admin_id: {
        type: String,
        required: true,
        trim: true
    },
    workspace_id: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true,
        default: "public"
    },
    created: {
        type: Date,
        required: true
    },
    workspace_code: {
        type: String,
        required: true
    },
    channel_code: {
        type: String,
        required: true
    },
    gen: {
        type: Boolean,
        required: true,
        default: false
    }
},
{
    timestamps: true
});

const joiValidate = function(obj) {
	var schema = Joi.object({
        name: Joi.string().required(),
		description: Joi.string().required(),
        admin_id: Joi.string().required(),
        workspace_id: Joi.string().required(),
        type: Joi.string().required(),
        created: Joi.date().required(),
        workspace_code: Joi.string().required(),
        channel_code: Joi.string().required()
	})
	return schema.validate(obj);
}

module.exports = mongoose.model('Channels', ChannelsSchema);
module.exports.ChannelJoiValidate = joiValidate