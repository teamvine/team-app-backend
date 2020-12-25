const mongoose = require('mongoose');
var Joi = require('joi');

const UserChatsSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        trim: true
    },
    workspace_id: {
        type: String,
        required: true,
        trim: true
    },
    chats: {
        type: Array,
        required: false,
    }
});

module.exports = mongoose.model('UserChats', UserChatsSchema);