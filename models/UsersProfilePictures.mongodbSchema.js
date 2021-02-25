const mongoose = require('mongoose');

const UsersProfilePicturesSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        trim: true
    },
    picture: {
        type: Object,
        required: true
    }
})

module.exports.UsersProfilePicturesModel = mongoose.model(
    "teamFiles_profilepictureentry", 
    UsersProfilePicturesSchema, 
    "teamFiles_profilepictureentry"
);