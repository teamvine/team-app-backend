const mongoose = require('mongoose');
var Joi = require('joi');

const DirectMessagesFilesSchema = new mongoose.Schema({
    file_id: {
        type: String,
        required: true,
        trim: true
    },
    direct_message_id: {
        type: String,
        required: true,
        trim: true
    }
});

DirectMessagesFilesSchema.methods.joiValidate = function(obj) {
	var schema = {
        file_id: Joi.string().required(),
        direct_message_id: Joi.string().required()
    }
	return Joi.validate(obj, schema);
}

module.exports = mongoose.model('DirectMessagesFiles', DirectMessagesFilesSchema);