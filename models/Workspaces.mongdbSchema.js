const mongoose = require('mongoose');
var Joi = require('joi');
const md5 = require('md5');

const WorkspacesSchema = new mongoose.Schema({
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
    type: {
        type: String,
        required: true,
        trim: true,
        default: "public"
    },
    created: {
        type: Date,
        required: true
    }
});

const workspaceJoiValidate = function(obj) {
	var schema = Joi.object({
        name: Joi.string().required(),
		description: Joi.string().required(),
        admin_id: Joi.string().required(),
        type: Joi.string().required(),
		created: Joi.date().required()
	})
	return schema.validate(obj);
}

module.exports.workspaceJoiValidate = workspaceJoiValidate
module.exports.workspaceModel = mongoose.model('Workspaces', WorkspacesSchema);