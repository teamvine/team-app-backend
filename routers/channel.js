const router = require("express").Router();
const baseRouter = require("./baseRouter");
const auth = require("../passport-config");
const { errorMessage } = require("../config/constants");
// const UserController = require("../controllers/user");
const channelController = require("../controllers/channel");
// const channelModel = require("../models/Channels.mongodbSchema")
// const channelMemberModel = require("../models/ChannelsMembers.mongodbSchema")
const { ChannelJoiValidate } = require("../models/Channels.mongodbSchema");

router.use(auth.jwtAuth)

router.post("/new-channel", async(req, res) => {
    console.log("#create channel request received...")
    let newChannel = req.body.channel
    newChannel.created = Date()
    if (ChannelJoiValidate(newChannel).error != undefined) {
        const err = ChannelJoiValidate(newChannel).error.details[0].message
        return baseRouter.error(res, 200, err.toString().replace(/"/gi, ""));
    }
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
                    }]).then(docs => {
                        if (docs === false) return baseRouter.error(res, 200, "Channel created successfully but failed to add admin! Report this bug.")
                        return baseRouter.success(res, 200, { new_channel: { info: doc, members: docs.ops } }, "Channel created successfully!")
                    })
                })
        })
})

// channelMemberModel.findByIdAndDelete("5f57935b8ce0963c278a7ab3").then(doc=>{})

router.post("/add-members", async(req, res) => {
    // req.body: {
    //   channel_id: "",
    //   workspace_id: "",
    //   members: []
    // }
    const channel_id = req.body.channel_id
    const workspace_id = req.body.workspace_id
    const members = req.body.members //as array
    channelController.AddNewMembersOrUpdate(workspace_id, channel_id, members)
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
    // req.body: {
    //   user_id: "",
    //   workspace_id: ""
    // }
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
module.exports = router;