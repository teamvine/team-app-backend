const router = require("express").Router();
const nodemailer = require("nodemailer");
const baseRouter = require("./baseRouter");
const { User, UserUpdateJoiValidate, UserJoiValidate } = require('../models/Users.mongodbShema')
const UserController = require("../controllers/user");
const workspaceController = require("../controllers/workspace")
const {getAllUsersJoinedChannels} = require("../controllers/channel")
const ID = require("../utils/codeGenerator")
const auth = require("../passport-config");
const { errorMessage, BCRYPT_SALT_ROUND } = require("../config/constants");
const bcrypt = require('bcryptjs');
const userController = require("../controllers/user");
const Joi = require("joi");


/**
 * user Login
 */
router.post("/login", (req, res) => {
    console.log("#Login request received....")
    if (req.body.email == "" || req.body.password == "" || !req.body.email || !req.body.password) return baseRouter.error(res, 200, errorMessage.NO_EMAIL_OR_PASSWORD)
    try {
        UserController.findByEmail(req.body.email, req.body.password)
            .then((user) => {
                if (!user || !bcrypt.compareSync(req.body.password, user.password))
                    return baseRouter.error(res, 200, errorMessage.WRONG_EMAIL_OR_PASSWORD);
                let token = auth.createToken(user);
                user.password = "";
                return baseRouter.success(res, 200, { token, user });
            })
            .catch((err) => {
                return baseRouter.error(res, 200, err.message);
            });
    } catch (err) {
        return baseRouter.error(res, 200, errorMessage.DEFAULT);
    }
});


/**
 * User register
 */
router.post("/register", async(req, res) => {
    console.log("#Register request received....")
    const newuser = req.body
    newuser.phone = ""
    newuser.role = ""
    newuser.country = "";
    newuser.born = null;
    newuser.created = Date();
    if (UserJoiValidate(req.body).error) { 
        const err = UserJoiValidate(req.body).error.details[0].message
        return baseRouter.error(res, 200, err.toString().replace(/"/gi, ""));
    }
    let sameEmailUser = await UserController.findByEmail(newuser.email, newuser.password)
    if (sameEmailUser) {
        return baseRouter.error(res, 200, errorMessage.USER_WITH_SAME_EMAIL_EXISTS)
    }
    newuser.password = bcrypt.hashSync(newuser.password, BCRYPT_SALT_ROUND);
    try {
        let user = await UserController.addUser(newuser);
        delete user.password;
        return baseRouter.success(res, 200, user, "* User registration succeeded! *");
    } catch (err) {
        return baseRouter.error(res, 200, errorMessage.DEFAULT);
    }
});


/**
 * All data of a user on initial page load
 */
router.get("/verify-token", async(req, res) => {
    console.log("#Verify token request received....")
    if (!req.query.token || req.query.token == "") {
        return baseRouter.error(res, 200, "REQUIRED_FIELDS_MISSING");
    }
    try {
        const decoded = auth.verifyToken(req.query.token);
        let AllInfo = {
            token: req.query.token,
            user: {},
            userAppFlow: {
                hasWorkspaces: false,
                switchedWorkspaces: decoded.workspace_id == "" ? false : true,
                currentWorkspace_id: decoded.workspace_id,
                gotUserJoinedChannels: false,
                gotUserDirectChatReceivers: false
            },
            userWorkspaces: [],
            currentWorkspace: {},
            userChannels: [],
            userContacts: []
        }
        //fetch user
        AllInfo.user = await UserController.getUserById(decoded.user_id) || {};
        AllInfo.user.password = ""
        //fetch workspaces
        AllInfo.userWorkspaces = await workspaceController.getUserWorkspaces(decoded.user_id) || []
        if (AllInfo.userWorkspaces.length > 0) AllInfo.userAppFlow.hasWorkspaces = true
        if (AllInfo.userAppFlow.switchedWorkspaces) {
            AllInfo.currentWorkspace = await workspaceController.findWorkspaceById(AllInfo.userAppFlow.currentWorkspace_id) || {}
            AllInfo.userChannels = await getAllUsersJoinedChannels(AllInfo.userAppFlow.currentWorkspace_id,decoded.user_id) || []
            AllInfo.userContacts = await userController.getUserChats(AllInfo.userAppFlow.currentWorkspace_id,decoded.user_id) || []
        }
        return baseRouter.success(res, 200, AllInfo, "Account verification success!");
    } catch (err) {
        return baseRouter.error(res, 200, errorMessage.DEFAULT);
    }
});


/**
 * Verify email by code
 */
router.post("/verify_email",(req,res)=>{
    console.log("#verify email request received...");
    const {EMAIL_VERIFICATION_TEMPLATE} = require("../utils/constants")
    let code = ID(8).generate();
    async function main() {
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "rconnect250@gmail.com", 
          pass: "chatever50", 
        },
        // debug: true,
        logger: true
      });
      let info = await transporter.sendMail({
        from: '"RCONNECT 👻" <rconnect250@gmail.com>',
        to: req.body.email,
        subject: "Email verification", 
        text: `Hi ${req.body.full_name}. Thank you for choosing RCONNECT. Your verification code is: ${code}`,
        // html: EMAIL_VERIFICATION_TEMPLATE.replace("USER_FULL_NAME",req.body.fname+' '+req.body.lname).replace("VERIFICATION_CODE",code)
      })
    }
    main().catch(console.error);
    return res.send({
        success: true,
        code: code,
        message: "Email sent!"
    })
})


/**
 * Check if email is registered
 */
router.get("/check-email-taken/:email",(req,res)=>{
    userController.getByEmail(req.params.email)
    .then(doc=>{
        if(doc!=null){
            return res.send({
                success: true,
                emailUsed: true
            })
        }else{
            return res.send({
                success: true,
                emailUsed: false
            })
        }
    })
    .catch((err)=>{
        return res.send({
            success: false,
            emailUsed: true,
        })
    })
})

router.use(auth.jwtAuth)


/**
 * Get user info by id
 */
router.get("/user-by-id/:user_id", (req, res) => {
    console.log("#get User by Id request received...");
    UserController.getUserById(req.params.user_id)
        .then(doc => {
            if (doc === false) return baseRouter.error(res, 200, "User not found!")
            return baseRouter.success(res, 200, { user: doc }, "request successfull")
        })
})

router.get("/check-user-for-chat", (req, res) => {
    console.log(req.query)
    return res.send("yes")
})


/**
 * Switch to a workspace: add it to token and get its user's data
 */
router.post("/switch-workspace", async(req, res) => {
    console.log("#switch to workspace request received...")
    const workspace = req.body.workspace
    let AllInfo = {
        token: "",
        workspace: workspace,
        userChannels: [],
        userContacts: []
    }
    if (!workspace || !workspace._id || workspace._id == "") {
        if (req.body.NEW == true) return baseRouter.error(res, 200, "No new workspace provided!");
    }
    AllInfo.token = auth.switchWorkspace(req.body.token, req.body.workspace)
    let ch = await getAllUsersJoinedChannels(workspace._id,req.body.user_id)
    let cnt = await userController.getUserChats(workspace._id,req.body.user_id)
    AllInfo.userChannels = ch
    AllInfo.userContacts = cnt
    return baseRouter.success(res, 200, AllInfo, "Workspace switched successfully!")
})


/**
 * Search users by name
 */
router.get("/by-name/:name", async(req, res) => {
    console.log("#find user by name request received..")
    let name = req.params.name
    userController.findByName(name)
        .then(doc => {
            return baseRouter.success(res, 200, doc)
        })
        .catch(err => {
            return baseRouter.error(res, 200, "No People found with their names containing that text.")
        })
})


/**
 * Add or update user contacts
 */
router.post("/add-or-update-user-chats", (req, res) => {
    const info = req.body //{user_id: null,workspace_id: null,chats: []}
    userController.AddNewUserChatsOrUpdate(info.workspace_id, info.user_id, info.chats)
        .then(doc => {
            if (doc == false) return baseRouter.error(res, 200, errorMessage.DEFAULT)
            return baseRouter.success(res, 200, {}, "Operation successfull!")
        })
})


/**
 * Get user contacts
 */
router.get("/get-user-chats", (req, res) => {
    userController.getUserChats(req.query.workspace_id, req.query.user_id).then(chats => {
        if (chats === false) return baseRouter.error(res, 200, errorMessage.DEFAULT + " Or may be that record doesn't exist!")
        return baseRouter.success(res, 200, { chats: chats }, "Success")
    }).catch(err => {
        return baseRouter.error(res, 200, errorMessage.DEFAULT + " Or may be that record doesn't exist!")
    })
})


/**
 * Get a given user account info
 */
router.post("/account-info", async(req, res) => {
    console.log("#get User info request received...");
    let account = {}
    let someErr = false
    if (req.body.query.fetchUser) {
        await userController.getUserById(req.body.user_id).then(doc => {
            if (doc === false || doc === null) {
                account.user = req.body.query.curr_user;
            } else {
                doc.password = "";
                account.user = doc;
            }
        }).catch(err => {
            console.log(err)
            someErr = true
            account.user = req.body.query.curr_user;
        })
    }
    if (req.body.query.check_if_curr_wrkspc_memb) {
        await workspaceController.getUserWorkspaces(account.user._id.toString())
            .then(docs => {
                if (docs === false || docs === null) {
                    account.user_workspaces = []
                } else {
                    account.user_workspaces = docs
                }
            }).catch(err => {
                console.log(err)
                account.user_workspaces = []
                someErr = true
            })
    }
    if (someErr) return baseRouter.success(res, 200, { success: false, account: account }, "Something went wrong!")
    return baseRouter.success(res, 200, { success: true, account: account }, "Request successful")
})

/**
 * Update user account info
 */
router.put("/update-password", (req, res) => {
    console.log("#update account requesr received...");
    let fields = {}
    userController.getUserById(req.body.user_id)
        .then(doc => {
            if (doc === false) return baseRouter.error(res, 200, errorMessage.DEFAULT)
            if (!bcrypt.compareSync(req.body.fields.old_password, doc.password)) {
                    return baseRouter.success(res, 200, { success: false }, "* The current password is incorrect *")
            }
            fields = {
                password: bcrypt.hashSync(req.body.fields.password, BCRYPT_SALT_ROUND)
            }
            userController.updateUserAccount(req.body.user_id, fields)
                .then(doc => {
                    if (doc === false) return baseRouter.error(res, 200, errorMessage.DEFAULT)
                    return baseRouter.success(res, 200, { success: true }, "Request successful")
                })
        })
})

router.put("/update-profile", (req,res)=> {
    if(!req.body.user_id || !req.body.fields || typeof(req.body.fields)!='object') return baseRouter.error(res, 200, "Invalid information")
    let fields = req.body.fields;
    if(typeof(fields.born)=="string"){
        if(fields.born.trim()==""){
            fields.born = null;
        }else {
            if(new Date(fields.born)=="Invalid Date") fields.born = null;
            else fields.born = new Date(fields.born);
        }
    } 
    if (UserUpdateJoiValidate(fields).error) { 
        const err = UserUpdateJoiValidate(fields).error.details[0].message
        return baseRouter.error(res, 200, err.toString().replace(/"/gi, ""));
    }
    userController.updateUserAccount(req.body.user_id, fields)
        .then(doc => {
            if (doc === false) return baseRouter.error(res, 200, errorMessage.DEFAULT)
            return baseRouter.success(
                res, 200, 
                { 
                    success: true 
                },
                "Request successful"
            )
        })
})


module.exports = router;