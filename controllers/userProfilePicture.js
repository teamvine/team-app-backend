const { UsersProfilePicturesModel } = require('../models/UsersProfilePictures.mongodbSchema')
const userProfilePictureController = {}

/**
 * get user profile picture doc
 * @param {String} user_id user id
 */
userProfilePictureController.getUserProfilePicture = (user_id)=> {
    return UsersProfilePicturesModel.findOne({user_id: user_id}).then(doc=> {
        if(doc==null) return false;
        else return doc;
    })
}


/**
 * get some specific fields
 * @param {String} user_id user id
 * @param {object} doc_fields projection query
 */
userProfilePictureController.getDocFieldsByUserId= (user_id, doc_fields)=> {
    return UsersProfilePicturesModel.findOne({user_id: user_id}, doc_fields).then(doc=> {
        if(doc==null) return false;
        else return doc;
    })
}

module.exports = userProfilePictureController