const router = require("express").Router();
const accountSettingsController = require('../controllers/settings')
const baseRouter = require("./baseRouter")
const {User} = require('../models/Users.mongodbShema')
const {errorMessage} = require('../config/constants')

/**
 * Initialise user account settings using id
 */
router.post("/new-settings", async(req,res)=> {
    if(!req.body.user_id || typeof(req.body.user_id)!="string"){
        return baseRouter.error(res, 200, "Invalid user id")
    }

    try {
        let user = await User.findById(req.body.user_id)
        if(!user) return baseRouter.error(res, 200, "Invalid user id")
    }catch(e){
        return baseRouter.error(res, 200, "Invalid user id")
    }
    let settings = {
        user_id: req.body.user_id,
        notification: {
            email_notifications: false,
            mobile_notifications: false,
            desktop_notifications: false,
            turn_all_off: false,
            hide_message_content: false,
            play_sound: false
        },
        theme: {
            color_theme: 'light',
            accent_color: 'blue'
        },
        message: {
            play_sound: true
        }
    }
    
    accountSettingsController.newSettings(settings).then(set=> {
        if(!set.success){
            return baseRouter.error(res, 200, set.message)
        }
        else{
            return baseRouter.success(res, 200, set.settings, "Request Successfull")
        }
    }).catch(err=> {
        return baseRouter.error(res, 200, errorMessage.DEFAULT)
    })
})

router.post("/update-nofication-settings", async(req,res)=> {
    
})

module.exports = router