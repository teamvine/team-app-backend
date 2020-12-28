const workspaceController = {};
const { workspaceModel } = require('../models/Workspaces.mongdbSchema')
const workspaceMemberModel = require("../models/WorkspacesMembers.mongodbSchema");
const { User } = require("../models/Users.mongodbShema")
const userController = require("./user");
const channelController = require('./channel');
const _ = require('lodash')

workspaceController.createNewWorkspace = async(workspace = {}) => {
    var new_workspace = new workspaceModel(workspace)
    return await new_workspace.save().then(workspc => {
        return workspc
    }).catch(() => {
        return false
    })
}

workspaceController.findWorkspace = async(properties = {}) => {
    return await workspaceModel.findOne(properties).then(doc => {
        return doc
    }).catch(() => {
        return false
    })
}

//add a new member or update
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

//this function will return all members of a workspace
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

//get all workspaces of a user
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

workspaceController.findWorkspaceById = async(workspace_id) => {
    return await workspaceModel.findById(workspace_id)
        .then(doc => {
            return doc
        }).catch(() => {
            return false
        })
}

workspaceController.getWorkspaceAllChannels = async(workspace_id) => {
    return await channelController.getAllChannelsInWorkspace(workspace_id)
        .then(docs => {
            return docs
        }).catch(() => {
            return false
        })
}

//search a member by any name
workspaceController.searchMembersByName = async(workspace_id, user_id, search_srting) => {
    return await workspaceController.getAllMembers(workspace_id)
        .then(members => {
            if (members === false) return false
            let filtered = []
            let found = []
            members.forEach(member => {
                let fullname = member.first_name.toString() + " " + member.last_name.toString()
                if (
                    member.first_name.toString().toLowerCase().indexOf(search_srting.toLowerCase()) >= 0 ||
                    member.last_name.toString().toLowerCase().indexOf(search_srting.toLowerCase()) >= 0 ||
                    fullname.toLowerCase().indexOf(search_srting.toLowerCase()) >= 0 ||
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

// workspaceController.addMembers = async(workspace_id = "", members = []) => {
//     let docs_to_instert = []
//     members.map((member) => {
//         docs_to_instert.push({
//             user_id: member._id.toString(),
//             workspace_id: workspace_id.toString(),
//             joined_on: Date()
//         })
//     })
//     return workspaceMemberModel.collection.insertMany(docs_to_instert).then(docs => {
//         return docs
//     }).catch(() => {
//         return false
//     })
// }


// workspaceController.getWorkspaceAllMembers = async(workspace_id) => {
//     let members = []
//     return await workspaceMemberModel.find({ workspace_id: workspace_id })
//         .then(async(docs) => {
//             if (docs.length < 1) {
//                 return members
//             } else {
//                 for (let i = 0; i < docs.length; i++) {
//                     await userController.getUserById(docs[i].user_id).then(user => {
//                         user.password = ""
//                         members.push(user)
//                     })
//                 }
//                 return members
//             }
//         }).catch((err) => {
//             console.log(err)
//             return false
//         })
// }

// workspaceController.getUsersAllWorkspaces = async(user_id) => {
//     let workspaces = []
//     return await workspaceMemberModel.find({ user_id: user_id })
//         .then(async(docs) => {
//             if (docs.length < 1) {
//                 return workspaces
//             } else {
//                 for (let i = 0; i < docs.length; i++) {
//                     await workspaceController.findWorkspaceById(docs[i].workspace_id).then(workspace => {
//                         if (workspace != false) workspaces.push(workspace)
//                     })
//                 }
//                 return workspaces
//             }
//         }).catch((err) => {
//             console.log(err)
//             return false
//         })
// }

workspaceController.findByName = async(name)=>{
    return await workspaceModel.find({ name: new RegExp(name, "i") ,type: "public" }, { //new RegExp(name, "i") yields /name/i
            _id: 1,
            name: 1,
            description: 1,
            admin_id: 1,
            created: 1
        })
        .sort({
            name: 1
        })
}

module.exports = workspaceController;