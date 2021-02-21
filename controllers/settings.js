const accountSettingsController = {};
const { String } = require('core-js');
const { AccountSettings, accountSettingsValidate } = require('../models/AccountSettings.mongodbSchema')

/**
 * create new settings
 * @param {Object} settings new settings object
 * @returns Object {success: boolean, message: string}
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

module.exports = accountSettingsController