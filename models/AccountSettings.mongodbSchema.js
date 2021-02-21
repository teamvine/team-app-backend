const mongoose = require('mongoose');
const Joi = require('joi')

const AccountSettingsSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    notification: {
        type: Object,
        required: true,
        default: {
            email_notifications: false,
            mobile_notifications: false,
            desktop_notifications: false,
            turn_all_off: false,
            hide_message_content: false,
            play_sound: false
        }
    },
    theme: {
        type: Object,
        required: true,
        default: {
            color_theme: 'light',
            accent_color: 'blue',
        }
    },
    message: {
        type: Object,
        required: true,
        default: {
            play_sound: true,
        }
    }
})

/**
 * validate settings object
 * @param {Object} obj new settings object
 * @returns {Joi.ValidationResult} joi validation result
 */
function accountSettingsValidate(obj){
    const schema = Joi.object({
        user_id: Joi.string().min(6).required(),
        notification: Joi.object({
            email_notifications: Joi.boolean().required(),
            mobile_notifications: Joi.boolean().required(),
            desktop_notifications: Joi.boolean().required(),
            turn_all_off: Joi.boolean().required(),
            hide_message_content: Joi.boolean().required(),
            play_sound: Joi.boolean().required()
        }).required(),
        theme: Joi.object({
            color_theme: Joi.string().required(),
            accent_color: Joi.string().required(),
        }).required(),
        message: Joi.object({
            play_sound: Joi.boolean().required(),
        }).required()
    })
    return schema.validate(obj)
}

/**
 * validate notification settings
 * @param {Object} obj notifiation settings object
 * @returns {Joi.ValidationResult} joi validation result
 */
function notificationSettingsValidate(obj){
    return Joi.object({
        email_notifications: Joi.boolean().required(),
        mobile_notifications: Joi.boolean().required(),
        desktop_notifications: Joi.boolean().required(),
        turn_all_off: Joi.boolean().required(),
        hide_message_content: Joi.boolean().required(),
        play_sound: Joi.boolean().required()
    }).validate(obj)
}

let AccountSettings = mongoose.model("accountSettings", AccountSettingsSchema)
module.exports = {
    AccountSettings,
    accountSettingsValidate,
    notificationSettingsValidate
}