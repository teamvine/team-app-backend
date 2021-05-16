const router = require("express").Router();
const baseRouter = require("./baseRouter");
const auth = require("../passport-config")
const { errorMessage } = require("../config/constants");
const { workspaceJoiValidate } = require('../models/Workspaces.mongdbSchema')
const workspaceController = require("../controllers/workspace");
const channelController = require("../controllers/channel");
const IDgen = require("../utils/codeGenerator")

router.use(auth.jwtAuth)


/**
 * Register an new Workspace
 */ 
router.post("/new-workspace", async(req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    const decoded = auth.verifyToken(token)
    console.log("#Create workspace request recieved...")
        //validate received workspace
    let newWorkspace = req.body.workspace
    newWorkspace.info.created = Date()
    newWorkspace.info.code = IDgen(13).generate()
    if (workspaceJoiValidate(newWorkspace.info).error != undefined) {
        const err = workspaceJoiValidate(newWorkspace.info).error.details[0].message
        return baseRouter.error(res, 200, err.toString().replace(/"/gi, ""));
    }
    // find the same workspace
    workspaceController.findWorkspace({
        name: req.body.workspace.info.name
    }).then(sameWorkspace => {
        if (sameWorkspace) return baseRouter.error(res, 200, "That workspace is already registered!")
        workspaceController.createNewWorkspace(newWorkspace.info)
            .then(workspace => {
                newWorkspace.info = workspace
                if (!newWorkspace.info) return baseRouter.error(res, 200, "Failed to create workspace!")
                    // if created create general channel
                channelController.newChannel({
                    name: "general",
                    description: "Workspace wide communication channel.",
                    admin_id: decoded.user_id,
                    workspace_id: newWorkspace.info._id.toString(),
                    type: "public",
                    created: Date(),
                    workspace_code: newWorkspace.info.code,
                    channel_code: IDgen(15).generate(),
                    gen: true
                }).then(result => {
                    if (result != false) newWorkspace.channels = [result]
                        // if created general add members to general
                        //if created gneral channel, add members to workspace
                    if (newWorkspace.members.length > 0) {
                        let newMembers = []
                        newWorkspace.members = newWorkspace.members.sort(() => Math.random() - 0.5) //shuffle members
                        newWorkspace.members.forEach(member => {
                            newMembers.push({
                                user_id: member._id.toString(),
                                active: true,
                                joined_on: Date()
                            })
                        });
                        newMembers = newMembers.sort(() => Math.random() - 0.5) //shuffle members again
                        workspaceController.AddNewMembersOrUpdate(newWorkspace.info._id.toString(), newMembers)
                            .then(members => {
                                if (!members) return baseRouter.success(res, 200, { info: newWorkspace.info }, "Workspace created but Failed to add members! Add them manually.")
                                channelController.AddNewMembersOrUpdate(newWorkspace.info._id.toString(), result._id.toString(), newWorkspace.members,false)
                                    .then(generalMembers => {
                                        if (!generalMembers) return baseRouter.success(res, 200, { info: newWorkspace.info }, "Workspace created but Failed to add members to general channel! Add them manually.")
                                        return baseRouter.success(res, 200, newWorkspace, "Workspace created Successfully!")
                                    })
                            })
                    } else {
                        return baseRouter.success(res, 200, newWorkspace, "Workspace created Successfully!")
                    }
                })

            })

    })
});



/**
 *  Get workspace info by id
 */
router.get("/workspace-by-id/:workspace_id", async(req, res) => {
    await workspaceController.findWorkspaceById(req.params.workspace_id)
        .then(doc => {
            if (doc == false) return baseRouter.error(res, 200, errorMessage.DEFAULT + " or that workspace if not found!")
            return baseRouter.success(res, 200, { workspace: doc }, "Workspace found!")
        })
})


/**
 * Get workspace's all members using its id
 */
router.get("/all-members/:workspace_id", async(req, res) => {
    await workspaceController.getAllMembers(req.params.workspace_id)
        .then(members => {
            if (members === false) return baseRouter.error(res, 200, errorMessage.DEFAULT + " or that workspace is not found!")
            return baseRouter.success(res, 200, { workspace_members: members }, "Members were got successfully!")
        })
})


/**
 * get all Workspace's channels using its id
 */
router.get("/all-channels/:workspace_id", async(req, res) => {
    await workspaceController.getWorkspaceAllChannels(req.params.workspace_id)
        .then(channels => {
            if (channels == false) return baseRouter.error(res, 200, errorMessage.DEFAULT + " or that workspace is not found!")
            return baseRouter.success(res, 200, { workspace_channels: channels }, "Members were got successfully!")
        })
})



/**
 * get user's All Joined workspaces using his/her id
 */
router.get("/user-all-workspaces/:user_id", async(req, res) => {
    await workspaceController.getUserWorkspaces(req.params.user_id)
        .then(workspaces => {
            if (workspaces === false) return baseRouter.error(res, 200, errorMessage.DEFAULT + " or that user is not found!")
            return baseRouter.success(res, 200, { user_workspaces: workspaces }, "Members were got successfully!")
        })
})



/**
 * Add members to a workspace using its id
 */
router.post("/add-members/:workspace_id", async(req, res) => {
    const workspace_id = req.params.workspace_id
    const members = req.body.members //as array
    let newMembers = []
    members.forEach(member => {
        newMembers.push({
            user_id: member._id.toString(),
            active: true,
            joined_on: new Date()
        })
    });
    let wrkspc_members = await workspaceController.AddNewMembersOrUpdate(workspace_id, newMembers)
    let gen_channel = await channelController.findChannel({workspace_id: workspace_id,gen: true})
    if(wrkspc_members==false){
        return baseRouter.error(res, 200, errorMessage.DEFAULT)
    }else{
        let genMembers = []
        newMembers.forEach(member => {
            genMembers.push({
                _id: member.user_id,
                active: true,
                joined_on: new Date()
            })
        });
        let gen_members = await channelController.AddNewMembersOrUpdate(workspace_id,gen_channel._id,genMembers,false)
        return baseRouter.success(res, 200, { added_members: wrkspc_members, channel_members: gen_members}, "Members added!")
    }
})


/**
 * search members by name or role from a workspace
 */
router.get("/search-members-by-name", (req, res) => {
    workspaceController.searchMembersByNameOrRole(req.query.workspace_id, req.query.user_id, req.query.search_string)
        .then(users => {
            if (users == false) return baseRouter.error(res, 200, errorMessage.DEFAULT)
            return baseRouter.success(res, 200, { filtered_members: users }, "Users filtered successfully!")
        })
})


// search workspace members that are not in a given channel
router.get("/search-members-notInChannel", (req,res)=>{
    let workspace_id = req.query.workspace_id
    let channel_id = req.query.channel_id
    let user_id = req.query.user_id
    let search_string = req.query.search_string
    workspaceController.searchMembersNotInChannel(workspace_id,channel_id,user_id,search_string)
    .then(users=>{
        if (users == false) return baseRouter.success(res, 200, { users: [] }, errorMessage.DEFAULT)
        return baseRouter.success(res, 200, { users: users }, "Users filtered successfully!")
    })
})



/**
 * Search public workspaces using their names
 */
router.get("/public-by-name/:name", async(req, res) => {
    console.log("#find workspace by name request received..")
    let name = req.params.name
    workspaceController.SearchPublicByName(name)
        .then(docs => {
            if(docs==null) return baseRouter.success(res, 200, {success: true,results: []});
            return baseRouter.success(res, 200, {success: true,results: docs})
        })
        .catch(err => {
            return baseRouter.error(res, 200, "No Organizations found with their names containing that text.")
        })
})

module.exports = router;