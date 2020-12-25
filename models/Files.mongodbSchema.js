const mongoose = require('mongoose');
var Joi = require('joi');

const FilesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    file_name: {
        type: String,
        required: true,
        trim: true
    },
    file_type: {
        type: String,
        required: true,
        trim: true
    },
    file_size: {
        type: Number,
        required: true,
        trim: true
    },
    mime_type: {
        type: String,
        required: true,
        trim: true
    },
    sender_id: {
        type: String,
        required: true,
        trim: true
    },
    sent_at: {
        type: Date,
        required: true
    }
});

FilesSchema.methods.joiValidate = function(obj) {
	var schema = {
        name: Joi.string().required(),
        url: Joi.string().required(),
        file_name: Joi.string().required(),
        file_type: Joi.string().required(),
        file_size: Joi.number().required(),
        mime_type: Joi.string().required(),
        sender_id: Joi.string().required(),
		sent_at: Joi.date().required()
	}
	return Joi.validate(obj, schema);
}

module.exports = mongoose.model('Files', FilesSchema);