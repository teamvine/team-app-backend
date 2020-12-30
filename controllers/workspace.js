const workspaceController = {};
const { workspaceModel } = require('../models/Workspaces.mongdbSchema')
const workspaceMemberModel = require("../models/WorkspacesMembers.mongodbSchema");
const { User } = require("../models/Users.mongodbShema")
const userController = require("./user");
const channelController = require('./channel');
const _ = require('lodash')


/**
 * Create a new workspace
 * @param {Object} workspace workspace info object
 * @returns A new created workspace document or false in case of error
 */
workspaceController.createNewWorkspace = async(workspace = {}) => {
    var new_workspace = new workspaceModel(workspace)
    return await new_workspace.save().then(workspc => {
        return workspc
    }).catch(() => {
        return false
    })
}


/**
 * Get a workspace based on given properties
 * @param {Object} properties query properties
 * @returns workspace document or false in case of error
 */
workspaceController.findWorkspace = async(properties = {}) => {
    return await workspaceModel.findOne(properties).then(doc => {
        return doc
    }).catch(() => {
        return false
    })
}


/**
 * add a new member or update
 * @param {String} workspace_id workspace id
 * @param {String} newMembers new mebers array with _id
 * @returns members or false in case of error
 */
workspaceController.AddNewMembersOrUpdate = async(workspace_id, newMembers = [{ user_id: "", active: true, joined_on: Date() }]) => {
    try {
        // newMembers = [{ user_id: "", active: true }]
        console.log(newMembers)
        let members = await workspaceMemberModel.findOne({ workspace_id: workspace_id })
        if (members == null) {
            members = new workspaceMemberModel({
                workspace_id: workspace_id,
                members: newMembers
            })
            console.log("new ", members)
            return await members.save()
        } else {
            console.log(members)
            for (let i = 0; i < members.members.length; i++) {
                for (let index = 0; index < newMembers.length; index++) {
                    if (members.members[i].user_id == newMembers[index].user_id) {
                        members.members[i].active = newMembers[index].active
                        newMembers.splice(index, 1);
                    }
                }
            }
            for (let index = 0; index < newMembers.length; index++) {
                members.members.push(newMembers[index])
            }
            members = await workspaceMemberModel.findOneAndUpdate({ workspace_id: workspace_id }, { members: members.members }, { new: true, useFindAndModify: false })
            return members
        }

    } catch (error) {
        return false
    }
}



/**
 * Get all members of a workspace
 * @param {String} workspace_id workspace id
 * @returns workspace all members or false in case of error
 */
workspaceController.getAllMembers = (workspace_id) => {
    let members = []
    return workspaceMemberModel.findOne({ workspace_id: workspace_id })
        .then(async(doc) => {
            if (doc == null) return [];
            // return active members only
            for (let index = 0; index < doc.members.length; index++) {
                if (doc.members[index].active == true) {
                    await User.findById(doc.members[index].user_id)
                        .then(user => {
                            members.push(_.pick(user, ["_id", "first_name", "last_name", "profile_pic", "display_name", "phone", "country", "email"]))
                        })
                }
            }
            return members
        }).catch(err => {
            return false
        })
}


/**
 * Get user's all joined workspaces
 * @param {String} user_id user id
 * @returns workspaces array or false in case of error
 */
workspaceController.getUserWorkspaces = async(user_id) => {
    let workspaces = []
    return await workspaceMemberModel.find({ 'members.user_id': user_id, 'members.active': true })
        .then(async(docs) => {
            if (docs.length < 1) {
                return workspaces
            } else {
                for (let i = 0; i < docs.length; i++) {
                    await workspaceController.findWorkspaceById(docs[i].workspace_id).then(workspace => {
                        if (workspace != false) workspaces.push(workspace)
                    })
                }
                return workspaces
            }
        }).catch(err => {
            console.log(err)
            return false
        })
}


/**
 * get a workspace using its id
 * @param {String} workspace_id workspace id
 * @returns workspace document or false in case of error
 */
workspaceController.findWorkspaceById = async(workspace_id) => {
    return await workspaceModel.findById(workspace_id)
        .then(doc => {
            return doc
        }).catch(() => {
            return false
        })
}


/**
 * get all channels in a workspace
 * @param {String} workspace_id workspace id
 * @returns workspace channels document array or false in case of error
 */
workspaceController.getWorkspaceAllChannels = async(workspace_id) => {
    return await channelController.getAllChannelsInWorkspace(workspace_id)
        .then(docs => {
            return docs
        }).catch(() => {
            return false
        })
}


/**
 * Search workspaces members using their names
 * @param {String} workspace_id workspace id
 * @param {String} user_id user id
 * @param {String} search_srting a search text(full_name or display name)
 * @returns workspace members documents in an array or false in case of error
 */
workspaceController.searchMembersByName = async(workspace_id, user_id, search_srting) => {
    return await workspaceController.getAllMembers(workspace_id)
        .then(members => {
            if (members === false) return false
            let filtered = []
            let found = []
            members.forEach(member => {
                if (
                    member.full_name.toString().toLowerCase().indexOf(search_srting.toLowerCase()) >= 0 ||
                    member.display_name.toString().toLowerCase().indexOf(search_srting.toLowerCase()) >= 0
                ) {
                    if (member._id.toString() != user_id.toString()) {
                        filtered.push(member)
                    }
                }
            })
            let i = 0;
            while (filtered[i] && i < 10) {
                found.push(filtered[i])
                i++;
            }
            return found;
        })
}



/**
 * Search public workspaces using their names
 * @param {String} name workspace's name
 * @returns An array of workspaces(Objects)-limit 10
 */
workspaceController.SearchPublicByName = async(name)=>{
    return await workspaceModel.find({ name: new RegExp(name, "i") ,type: "public" }, { //new RegExp(name, "i") yields /name/i
            _id: 1,
            name: 1,
            description: 1,
            admin_id: 1,
            created: 1,
            code: 1
        })
        .sort({
            name: 1
        }).limit(10)
}

module.exports = workspaceController;