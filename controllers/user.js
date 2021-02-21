const userController = {};
const { User } = require("../models/Users.mongodbShema");
const UserChats = require("../models/UsersChats.mongodbSchema")
const { errorMessage } = require("../config/constants");
const _ = require('lodash')
const accountSettingsController = require('./settings')


userController.findByName = (name) => {
    return User.find({ full_name: new RegExp(name, "i") }, { //new RegExp(name, "i") yields /name/i
            _id: 1,
            full_name: 1,
            display_name: 1,
            profile_pic: 1,
            country: 1
        })
        .sort({
            full_name: 1
        }).limit(10)
}

userController.findBy = (key, value) => {
    return User.findOne(key, value);
};

userController.getUserById = async(id) => {
    return await User.findById(id).then(doc => {
        return doc
    }).catch(() => {
        return false
    })
};

userController.addUser = (user) => {
    const newUser = new User(user)
    newUser.save()

    let settings = {
        user_id: newUser._id+"",
        notification: {
            email_notifications: false,
            mobile_notifications: false,
            desktop_notifications: false,
            turn_all_off: false,
            hide_message_content: false,
            play_sound: true,
        },
        theme: {
            color_theme: 'light',
            accent_color: 'blue'
        },
        message: {
            play_sound: true
        }
    }
    return accountSettingsController.newSettings(settings).then(set=> {
        if(!set.success){
            console.log(new Date(), " ERROR", "Failed to create user settings")
        }
        return newUser;
    }).catch(err=> {
        console.log(new Date(), " ERROR", "Failed to create user settings")
        return newUser;
    })
};

userController.getUserChats = (workspace_id, user_id) => {
    let members = []
    return UserChats.findOne({ user_id: user_id, workspace_id: workspace_id })
        .then(async(doc) => {
            if (doc == null) return [];
            // return active chats only
            for (let index = 0; index < doc.chats.length; index++) {
                if (doc.chats[index].active == true) {
                    await User.findById(doc.chats[index].user_id)
                        .then(user => {
                            members.push(_.pick(user, ["_id", "full_name", "profile_pic", "display_name", "phone", "email"]))
                        })
                }
            }
            return members
        }).catch(err => {
            return false
        })
}

userController.AddNewUserChatsOrUpdate = async(workspace_id, user_id, newchats = [{ user_id: "", active: true }]) => {
    try {
        // newchats[{user_id: "",active: ""}]
        let userChats = await UserChats.findOne({ user_id: user_id, workspace_id: workspace_id })
        if (userChats == null) {
            userChats = new UserChats({
                user_id: user_id,
                workspace_id: workspace_id,
                chats: newchats
            })
            return await userChats.save()
        } else {
            for (let i = 0; i < userChats.chats.length; i++) {
                for (let index = 0; index < newchats.length; index++) {
                    if (userChats.chats[i].user_id == newchats[index].user_id) {
                        userChats.chats[i].active = newchats[index].active
                        newchats.splice(index, 1);
                    }
                }
            }
            for (let index = 0; index < newchats.length; index++) {
                userChats.chats.push(newchats[index])
            }
            userChats = await UserChats.findOneAndUpdate({ user_id: user_id, workspace_id: workspace_id }, { chats: userChats.chats }, { new: true, useFindAndModify: false })
            return userChats
        }
    } catch (error) {
        return false
    }

}

userController.findByEmail = (email, password) => {
    if (!email || !password) {
        throw new Error(errorMessage.NO_EMAIL_OR_PASSWORD);
    }
    return User.findOne({ email: email })
};
userController.getByEmail= (email)=>{
    return User.findOne({ email: email })
}

userController.updateUserAccount = async(user_id, fields) => {
    return await User.findOneAndUpdate({ _id: user_id }, fields, { new: true, useFindAndModify: false })
        .then(doc => {
            return doc
        })
        .catch(err => {
            return false
        })
}


userController.User = User;

module.exports = userController;