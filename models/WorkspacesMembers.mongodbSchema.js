const mongoose = require('mongoose');
var Joi = require('joi');

const WorkspacesMembersSchema = new mongoose.Schema({
    workspace_id: {
        type: String,
        required: true,
        trim: true
    },
    members: {
        type: Array,
        required: true
    }
});

WorkspacesMembersSchema.methods.joiValidate = function(obj) {
    var schema = {
        workspace_id: Joi.string().required(),
        members: Joi.array().required()
    }
    return Joi.validate(obj, schema);
}

module.exports = mongoose.model('WorkspacesMembers', WorkspacesMembersSchema);