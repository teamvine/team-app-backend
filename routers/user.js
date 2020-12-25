const router = require("express").Router();
const nodemailer = require("nodemailer");
const baseRouter = require("./baseRouter");
const { User, UserJoiValidate } = require('../models/Users.mongodbShema')
const UserController = require("../controllers/user");
const workspaceController = require("../controllers/workspace")
const ID = require("../utils/codeGenerator")
const auth = require("../passport-config");
const { errorMessage, BCRYPT_SALT_ROUND } = require("../config/constants");
const bcrypt = require('bcryptjs');
const userController = require("../controllers/user");

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

router.get("/verify-token", async(req, res) => {
    console.log("#Verify token request received....")
    if (!req.query.token || req.query.token == "") {
        return baseRouter.error(res, 200, "REQUIRED_FIELDS_MISSING");
    }
    try {
        const decoded = auth.verifyToken(req.query.token);
        let userAppFlow = {
            hasWorkspaces: false,
            switchedWorkspaces: decoded.workspace_id == "" ? false : true,
            currentWorkspace_id: decoded.workspace_id,
            gotUserJoinedChannels: false,
            gotUserDirectChatReceivers: false
        }
        let userWorkspaces = []
        let currentWorkspace = {}
            //fetch user
        let user = await UserController.getUserById(decoded.user_id);
        user.password = ""
            //fetch workspaces
        await workspaceController.getUserWorkspaces(decoded.user_id)
            .then(workspaces => {
                if (workspaces !== false) {
                    if (workspaces.length > 0) userAppFlow.hasWorkspaces = true
                    userWorkspaces = workspaces
                }
            })
        if (userAppFlow.switchedWorkspaces) {
            await workspaceController.findWorkspaceById(userAppFlow.currentWorkspace_id)
                .then(workspace => {
                    if (workspace != false) currentWorkspace = workspace
                })
        }
        return baseRouter.success(res, 200, { user, userAppFlow, userWorkspaces, currentWorkspace }, "Account verification success!");
    } catch (err) {
        return baseRouter.error(res, 200, errorMessage.DEFAULT);
    }
});

router.post("/verify_email",(req,res)=>{
    const {EMAIL_VERIFICATION_TEMPLATE} = require("../utils/constants")
    async function main() {
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "rconnect250@gmail.com", 
          pass: "chatever50", 
        },
        // debug: true,
        // logger: true
      });
      let code = ID(8).generate();
      let info = await transporter.sendMail({
        from: '"RCONNECT 👻" <rconnect250@gmail.com>',
        to: req.body.email,
        subject: "Email verification", 
        text: `Hi ${req.body.fname+' '+req.body.lname}. Thank you for choosing RCONNECT. Your verification code is: ${code}`,
        html: EMAIL_VERIFICATION_TEMPLATE.replace("USER_FULL_NAME",req.body.fname+' '+req.body.lname).replace("VERIFICATION_CODE",code)
      })
    }
    main().catch(console.error);
    return res.send({
        success: true,
        message: "Email sent!"
    })
})

router.use(auth.jwtAuth)

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

router.post("/switch-workspace", async(req, res) => {
    console.log("#switch workspace request received...")
    const workspace = req.body.workspace
    if (!workspace || !workspace._id || workspace._id == "") {
        if (req.body.NEW == true) return baseRouter.error(res, 200, "No new workspace provided!");
    }
    const newToken = auth.switchWorkspace(req.body.token, req.body.workspace)
    return baseRouter.success(res, 200, { token: newToken }, "Workspace switched successfully!")
})

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

router.post("/add-or-update-user-chats", (req, res) => {
    const info = req.body //{user_id: null,workspace_id: null,chats: []}
    userController.AddNewUserChatsOrUpdate(info.workspace_id, info.user_id, info.chats)
        .then(doc => {
            if (doc == false) return baseRouter.error(res, 200, errorMessage.DEFAULT)
            return baseRouter.success(res, 200, {}, "Operation successfull!")
        })
})

router.get("/get-user-chats", (req, res) => {
    userController.getUserChats(req.query.workspace_id, req.query.user_id).then(chats => {
        if (chats === false) return baseRouter.error(res, 200, errorMessage.DEFAULT + " Or may be that record doesn't exist!")
        return baseRouter.success(res, 200, { chats: chats }, "Success")
    }).catch(err => {
        return baseRouter.error(res, 200, errorMessage.DEFAULT + " Or may be that record doesn't exist!")
    })
})

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
    // console.log("account: ", account)
    if (someErr) return baseRouter.success(res, 200, { success: false, account: account }, "Something went wrong!")
    return baseRouter.success(res, 200, { success: true, account: account }, "Request successful")
})

router.put("/update-account", (req, res) => {
    console.log("#update account requesr received...");
    let fields = {}
    if (req.body.fields.password) {
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
    } else {
        userController.updateUserAccount(req.body.user_id, req.body.fields)
            .then(doc => {
                if (doc === false) return baseRouter.error(res, 200, errorMessage.DEFAULT)
                return baseRouter.success(res, 200, { success: true, user: doc }, "Request successful")
            })
    }
})


router.post("/verify_email/:email",(req,res)=>{

    const nodemailer = require("nodemailer");

    
    async function main() {
      
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "rconnect250@gmail.com", 
          pass: "chatever50", 
        },
        // debug: true,
        // logger: true
      });
    

      function makeId(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result.toUpperCase();
     }

      let info = await transporter.sendMail({
         
        from: '"RCONNECT 👻" <rconnect250@gmail.com>',
        to: req.params.email,
        subject: "✔", 
        text: "Email verification", 
        html:`<!DOCTYPE html>
        <html>
        <head>
            <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
        </head>
        <style type="text/css">
        body{background-color: #88BDBF;margin: 0px;}
        </style>
        <body>
            <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #5e6ce7;">
                <tr>
                    <td>
                        <table border="0" width="100%">
                            <tr>
                                <td>
                                    <h1>RCONNECT</h1>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td>
                        <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
                            <tr>
                                <td style="background-color:#337eee;height:100px;font-size:50px;color:#fff;"><i class="fa fa-envelope-o" aria-hidden="true"></i></td>
                            </tr>
                            <tr>
                                <td>
                                    <h1 style="padding-top:25px;">Email Confirmation</h1>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p style="padding:0px 100px;">
                                    ${makeId(8)}
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td>
                        <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
                            <tr>
                                <td>
                                    <h3 style="margin-top:10px;">Stay in touch</h3>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div style="margin-top:20px;">
                                        <a href="www.twitter.com" style="text-decoration: none;">
                                            <span class="twit" style="padding:10px 9px;background-color:#4099FF;color:#fff;border-radius:50%;">
                                            <i class="fa fa-twitter" aria-hidden="true" style="height:20px;width:20px;">
                                            </i>
                                        </span>
                                    </a>
                                        <a href="https://www.facebook.com/pages/creation/?ref_type=launch_point" style="text-decoration: none;">
                                            <span class="fb" style="padding:10px 9px;background-color: #3B5998;color:#fff;border-radius:50%;">
                                                <i class="fa fa-facebook" aria-hidden="true" style="height:20px;width:20px;">
                                                </i>
                                            </span>
                                        </a>
                                        <a href="rconnect250@gmail.com" style="text-decoration: none;">
                                            <span class="msg" style="padding:10px 9px;background-color: #FFC400;color:#fff;border-radius:50%;"">
                                                <i class="fa fa-envelope-o" aria-hidden="true" style="height:20px;width:20px;">
                                                </i></span>
                                            </a>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div style="margin-top: 20px;">
                                        <span style="font-size:12px;">Copyright © rconnect</span>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `
      });
      console.log("Message sent: %s", info.messageId);
    
    }
    
    main().catch(console.error);
 
})


module.exports = router;