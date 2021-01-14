const router = require("express").Router();
const baseRouter = require("./baseRouter");
const auth = require("../passport-config");
const { errorMessage } = require("../config/constants");
const DirectMessagesController = require('../controllers/personalMessage')
const ChannelMessagesController = require('../controllers/message');
const personalMessageController = require("../controllers/personalMessage");
const messageController = require("../controllers/message");


router.use(auth.jwtAuth)

//get direct chat all messages
router.get("/get-direct-chat-messages", (req, res) => {
    personalMessageController.countMessages(req.query.workspace_id, req.query.user_id, req.query.partner_id)
        .then(num => {
            if (num === false) return baseRouter.error(res, 200, errorMessage.DEFAULT);
            if(num<1) return baseRouter.success(res, 200, { messages: [],noMore: true }, "Request successfull.");
            DirectMessagesController.getPersonalChatMessages(req.query.workspace_id, req.query.user_id, req.query.partner_id)
            .then(messages => {
                if (messages == false) return baseRouter.success(res, 200, { messages: [],noMore: true }, "Request successfull.")
                return baseRouter.success(res, 200, { messages: messages,noMore: num>20? false:true }, "Request successfull.")
            })
        })
        .catch(err=>{
            console.log(err)
            return baseRouter.error(res, 200, errorMessage.DEFAULT)
        })
})

//get all channel chat messages
router.get("/get-all-channel-messages", (req, res) => {
    ChannelMessagesController.countMessages(req.query.workspace_id, req.query.channel_id)
        .then(num => {
            if (num === false) return baseRouter.error(res, 200, errorMessage.DEFAULT);
            if(num<1) return baseRouter.success(res, 200, { messages: [],noMore: true }, "Request successfull.");
            ChannelMessagesController.getChannelAllMessages(req.query.workspace_id, req.query.channel_id)
            .then(messages => {
                if (messages == false) return baseRouter.success(res, 200, { messages: [],noMore: true }, "Request successfull.")
                return baseRouter.success(res, 200, { messages: messages,noMore: num>20? false:true }, "Request successfull.")
            })
        })
        .catch(err=>{
            console.log(err)
            return baseRouter.error(res, 200, errorMessage.DEFAULT)
        })
})

// get few older messages in a channel
router.get("/get-channel-older-messages", (req, res) => {
    let config = new Object(req.query);
    config.config = JSON.parse(config.config);
    ChannelMessagesController.countMessages(config.workspace_id, config.channel_id)
        .then(num => {
            if (num === false) return baseRouter.error(res, 200, errorMessage.DEFAULT);
            if (num == config.config.ALL_SMS_LENGTH) return baseRouter.success(res, 200, { success: true, noMoreMessages: true, messages: [] }, "Request successfull");
            ChannelMessagesController.getFewOlderMessages(config.workspace_id, config.channel_id, config.config.LAST_SMS_ID)
                .then(docs => {
                    if (docs === false) return baseRouter.error(res, 200, errorMessage.DEFAULT);
                    let newCount = Number(config.config.ALL_SMS_LENGTH + docs.length);
                    if (newCount == Number(num)) return baseRouter.success(res, 200, { success: true, noMoreMessages: true, messages: docs }, "Request successfull");
                    return baseRouter.success(res, 200, { success: true, noMoreMessages: false, messages: docs }, "Request successfull");
                })
        }).catch(err => {
            console.log(err)
            return baseRouter.error(res, 200, errorMessage.DEFAULT)
        })
})

//delete a channel message
router.delete('/delete-channel-message', (req,res)=>{
    console.log("#delete channel message request received...");
    let w_id = req.body.workspace_id
    let c_id = req.body.channel_id
    let m_id = req.body.message_id
    messageController.deleteMessage(w_id,c_id,m_id)
    .then(success => {
        if(!success){
            return baseRouter.error(res, 200, "Request failed")
        }
        else {
           return baseRouter.success(res, 200, { success: true, message: "Message deleted" }, "Request successfull");
        }
    })
    .catch(err=>{
        return baseRouter.error(res, 200, errorMessage.DEFAULT)
    })
})

// get few older messages in a direct chat
router.get("/get-direct-chat-older-messages", (req, res) => {
    let config = new Object(req.query);
    config.config = JSON.parse(config.config);
    personalMessageController.countMessages(config.workspace_id, config.user_id, config.partner_id)
        .then(num => {
            if (num === false) return baseRouter.error(res, 200, errorMessage.DEFAULT);
            if (num == config.config.ALL_SMS_LENGTH) return baseRouter.success(res, 200, { success: true, noMoreMessages: true, messages: [] }, "Request successfull");
            personalMessageController.getFewOlderMessages(config.workspace_id, config.user_id, config.partner_id, config.config.LAST_SMS_ID)
                .then(docs => {
                    if (docs === false) return baseRouter.error(res, 200, errorMessage.DEFAULT);
                    let newCount = Number(config.config.ALL_SMS_LENGTH + docs.length);
                    if (newCount == Number(num)) return baseRouter.success(res, 200, { success: true, noMoreMessages: true, messages: docs }, "Request successfull");
                    return baseRouter.success(res, 200, { success: true, noMoreMessages: false, messages: docs }, "Request successfull");
                })
        }).catch(err => {
            console.log(err)
            return baseRouter.error(res, 200, errorMessage.DEFAULT)
        })
})

module.exports = router