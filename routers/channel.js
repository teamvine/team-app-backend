const router = require("express").Router();
const baseRouter = require("./baseRouter");
const auth = require("../passport-config");
const { errorMessage } = require("../config/constants");
const channelController = require("../controllers/channel");
const { ChannelJoiValidate } = require("../models/Channels.mongodbSchema");
const IDgen = require("../utils/codeGenerator")

router.use(auth.jwtAuth)

router.post("/new-channel", async(req, res) => {
    console.log("#create channel request received...")
    let newChannel = req.body.channel
    newChannel.created = Date()
    newChannel.channel_code = IDgen(15).generate()
    if (ChannelJoiValidate(newChannel).error != undefined) {
        const err = ChannelJoiValidate(newChannel).error.details[0].message
        return baseRouter.error(res, 200, err.toString().replace(/"/gi, ""));
    }
    newChannel.gen = false
    // find same channel
    await channelController.findChannel({ name: newChannel.name })
        .then(result => {
            if (result) return baseRouter.error(res, 200, "That channel already exists!")
                // create channel
            channelController.newChannel(newChannel)
                .then(doc => {
                    if (doc == false) return baseRouter.error(res, 200, "Failed to create channel!")
                    channelController.AddNewMembersOrUpdate(newChannel.workspace_id, doc._id.toString(), [{
                        _id: newChannel.admin_id.toString()
                    }],false).then(docs => {
                        if (docs === false) return baseRouter.error(res, 200, "Channel created successfully but failed to add admin! Report this bug.")
                        return baseRouter.success(res, 200, { new_channel: { info: doc, members: docs.ops } }, "Channel created successfully!")
                    })
                })
        })
})

router.post("/add-members", async(req, res) => {
    console.log("#join channel request...")
    // req.body: {
    //   channel_id: "",
    //   workspace_id: "",
    //   members: []
    // }
    const channel_id = req.body.channel_id
    const workspace_id = req.body.workspace_id
    const members = req.body.members //as array
    channelController.AddNewMembersOrUpdate(workspace_id, channel_id, members,false)
        .then(docs => {
            if (docs === false) return baseRouter.error(res, 200, errorMessage.DEFAULT)
            return baseRouter.success(res, 200, { added_members: docs }, "Members added!")
        })
})

router.get("/channel-by-id/:channel_id", (req, res) => {
    console.log("#get channel by id request received...")
    channelController.findChannelById(req.params.channel_id)
        .then(doc => {
            if (doc == false) return baseRouter.error(res, 200, errorMessage.DEFAULT + " or that channel doesn't exist!")
            return baseRouter.success(res, 200, { channel: doc }, "Channel exists!")
        })
})

router.post("/user-all-joined-channels", (req, res) => {
    channelController.getAllUsersJoinedChannels(req.body.workspace_id, req.body.user_id)
        .then(docs => {
            if (docs === false) return baseRouter.error(res, 200, errorMessage.DEFAULT)
            return baseRouter.success(res, 200, { channels: docs }, "All channels found!")
        })
})

router.get("/all-members", async(req, res) => {
    await channelController.getAllMembers(req.query.workspace_id, req.query.channel_id)
        .then(members => {
            if (members === false) return baseRouter.error(res, 200, errorMessage.DEFAULT + " or that channel is not found!")
            return baseRouter.success(res, 200, { channel_members: members }, "Members were got successfully!")
        })
})


router.get("/search-public-by-name", async(req,res)=>{
    await channelController.searchPublicChannelsByName(req.query.workspace_id,req.query.text)
    .then(channels=>{
        if(!channels) return baseRouter.success(res,200,{channels: channels},"Something went wrong")
        baseRouter.success(res,200,{channels: channels},"Request successfull")
    })
})

module.exports = router;