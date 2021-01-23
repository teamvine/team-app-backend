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