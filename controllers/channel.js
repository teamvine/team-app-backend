const channelController = {};
const ChannelModel = require("../models/Channels.mongodbSchema");
const ChannelMembersModel = require("../models/ChannelsMembers.mongodbSchema")
const { User } = require("../models/Users.mongodbShema")
const _ = require('lodash')

channelController.newChannel = async(channel) => {
    let newChannel = new ChannelModel(channel);
    return await newChannel.save().then(doc => {
        return doc
    }).catch(() => {
        return false
    })
};

channelController.findChannel = async(properties = {}) => {
    return await ChannelModel.findOne(properties).then(doc => {
        return doc
    }).catch(() => {
        return false
    })
}

channelController.findChannelById = async(channel_id) => {
    return await ChannelModel.findById(channel_id)
        .then(doc => {
            return doc
        }).catch(() => {
            return false
        })
}

channelController.AddNewMembersOrUpdate = async(workspace_id = "", channel_id = "", members = []) => {
    let docs_to_instert = []
    members.map((member) => {
        docs_to_instert.push({
            user_id: member._id.toString(),
            active: true,
            joined_on: Date()
        })
    })
    try {
        let members = await ChannelMembersModel.findOne({ workspace_id: workspace_id, channel_id: channel_id })
        if (members == null) {
            members = new ChannelMembersModel({
                    channel_id: channel_id,
                    workspace_id: workspace_id,
                    members: docs_to_instert
                })
                // console.log("new ", members)
            return await members.save()
        } else {
            // console.log(members)
            for (let i = 0; i < members.members.length; i++) {
                for (let index = 0; index < docs_to_instert.length; index++) {
                    if (members.members[i].user_id == docs_to_instert[index].user_id) {
                        members.members[i].active = docs_to_instert[index].active
                        docs_to_instert.splice(index, 1);
                    }
                }
            }
            for (let index = 0; index < docs_to_instert.length; index++) {
                members.members.push(docs_to_instert[index])
            }
            members = await ChannelMembersModel.findOneAndUpdate({ workspace_id: workspace_id, channel_id: channel_id }, { members: members.members }, { new: true, useFindAndModify: false })
            return members
        }

    } catch (error) {
        console.log(err)
        return false
    }
}

//this function will return all members of a channel
channelController.getAllMembers = (workspace_id, channel_id) => {
    let members = []
    return ChannelMembersModel.findOne({ workspace_id: workspace_id, channel_id: channel_id })
        .then(async(doc) => {
            if (doc === null) return [];
            // return active members only
            for (let index = 0; index < doc.members.length; index++) {
                if (doc.members[index].active == true) {
                    await User.findById(doc.members[index].user_id)
                        .then(user => {
                            members.push(_.pick(user, ["_id", "first_name", "last_name", "profile_pic", "display_name", "email"]))
                        })
                }
            }
            return members
        }).catch(err => {
            console.log(err);
            return false
        })
}

channelController.getAllChannelsInWorkspace = async(workspace_id) => {
    return await ChannelModel.find({ workspace_id: workspace_id })
        .then(docs => {
            return docs
        }).catch(() => {
            return false
        })
};

// function to return all joined channels of a user in a given workspace
channelController.getAllUsersJoinedChannels = async(workspace_id, user_id) => {
    let channels = []
    return await ChannelMembersModel.find({
            'members.user_id': user_id,
            'members.active': true,
            workspace_id: workspace_id
        })
        .then(async(docs) => {
            for (let i = 0; i < docs.length; i++) {
                await channelController.findChannelById(docs[i].channel_id).then(channel => {
                    if (channel != false) channels.push(channel)
                })
            }
            return channels
        }).catch((err) => {
            console.log(err)
            return false
        })
}

module.exports = channelController;