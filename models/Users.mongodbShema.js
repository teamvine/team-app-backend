const mongoose = require('mongoose');
var Joi = require('joi');
var passwdRegex = require('../config/constants').regExp.VALID_PASSWORD

const UsersSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true,
        trim: true
    },
    display_name: {
        type: String,
        required: true,
        trim: true
    },
    profile_pic: {
        type: String,
        required: true,
        trim: true,
        default: "default_prof_pic.png"
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        default: "",
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        default: ""
    },
    country: {
        type: String,
        trim: true,
        default: ""
    },
    born: {
        type: Date,
        default: null,

    },
    created: {
        type: Date,
        required: true
    }
},
{
    timestamps: true
});

module.exports.UserJoiValidate = function(obj) {
    var schema = Joi.object({
        full_name: Joi.string().required(),
        display_name: Joi.string().min(4).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(30).regex(passwdRegex).required(),
        role: Joi.string().allow(""),
        phone: Joi.string().allow(""),
        country: Joi.string().allow(""),
        born: Joi.date().allow(null),
        created: Joi.date().required()
    })
    return schema.validate(obj);
}

module.exports.UserUpdateJoiValidate = function(obj) {
    var schema = Joi.object({
        full_name: Joi.string().min(4).required(),
        display_name: Joi.string().min(4).max(30).required(),
        role: Joi.string().allow("").required(),
        phone: Joi.string().allow("").required(),
        country: Joi.string().allow("").required(),
        born: Joi.date().allow(null).required()
    })
    return schema.validate(obj);
}

module.exports.User = mongoose.model('Users', UsersSchema);