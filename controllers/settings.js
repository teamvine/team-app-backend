const accountSettingsController = {};
const { AccountSettings, accountSettingsValidate, notificationSettingsValidate } = require('../models/AccountSettings.mongodbSchema')

/**
 * create new settings
 * @param {Object} settings new settings object
 * @returns Object {success: boolean, message: string, settings: document(optional)}
 */
accountSettingsController.newSettings = async(settings)=>{
    if(accountSettingsValidate(settings).error){
        return {
            success: false,
            message: accountSettingsValidate(settings).error.details[0].message.replace(/"/gi, "")
        }
    }else{
        let same = await AccountSettings.findOne({user_id: settings.user_id})
        if(same || same!=null) {
            return {
                success: false,
                message: "Document already exists!"
            }
        }
        let newSettings = new AccountSettings(settings);
        return await newSettings.save().then(doc=> {
            return {
                success: true,
                settings: doc,
                message: "Settings saved"
            }
        }).catch(err=> ({
            success: false,
            message: err.message
        }))
    }
}



/**
 * update notifications settings 
 * @param {String} user_id user settings id
 * @param {Object} settings notification settings
 * @returns Object {success: boolean, message: string}
 */
accountSettingsController.updateNotificationSettings = async(user_id, settings)=>{
    if(notificationSettingsValidate(settings).error){
        return {
            success: false,
            message: accountSettingsValidate(settings).error.details[0].message.replace(/"/gi, "")
        }
    }
    return AccountSettings.findOneAndUpdate({user_id: user_id}, {notification: settings}, {new: true, useFindAndModify: false})
    .then(doc=> {
        if(doc) return {
            success: true,
            message: "Account updated!"
        };
        else return {
            success: false,
            message: "Document doesn't exist!"
        }
    }).catch(err=> {
        return {
            success: false,
            message: err.message+""
        }
    })
}

module.exports = accountSettingsController