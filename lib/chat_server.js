const Server = require("socket.io");
const UserController = require("../controllers/user");
const MessageController = require("../controllers/message");
const PersonalMessageController = require("../controllers/personalMessage");
const messageRepliesController = require('../controllers/messageReplies')
const personalMessageRepliesController = require('../controllers/personalMessageReplies')
const { event } = require("../config/constants");
const { auth } = require('./chat_server.middlewares')
const _ = require('lodash')
const bcrypt = require('bcryptjs');
let io;
const SOCKET_HANDLERS = {};


//========BIND THE SOCKET.IO TO A SERVER=========== 

/**
 * Attach our socket.io to a server
 * @param http nodejs server i.e express(),http or https to bind socket.io to
 */
exports.listen = (http) => {
    io = new Server(http, {
        allowRequest: auth
    });
    /**
     * On connection, attach all listeners
     */
    io.on("connection", (socket) => {
        console.log(`#socket ${socket.id} connected to server.`);
        SOCKET_HANDLERS.handleIdentifySocket(socket);
        SOCKET_HANDLERS.handleUnidentifySocket(socket);
        SOCKET_HANDLERS.handleJoinWorkspaceRoom(socket);
        SOCKET_HANDLERS.handleLeaveWorkspaceRoom(socket);
        SOCKET_HANDLERS.handleJoinDirectChatRoom(socket);
        SOCKET_HANDLERS.handleLeaveDirectChatRoom(socket);
        SOCKET_HANDLERS.handleTypingStatus(socket);
        SOCKET_HANDLERS.handlePersonalMessage(socket, io);
        SOCKET_HANDLERS.handleReplyPersonalMessage(socket, io);
        SOCKET_HANDLERS.handleMessageBroadcasting(socket, io);
        SOCKET_HANDLERS.handleReplyMessage(socket, io);
        SOCKET_HANDLERS.handleDisconnecting(socket);
        SOCKET_HANDLERS.handleDisconnect(socket);

        // handleJoinSavedChannel(socket);
        // // handleJoinChannel(socket);
        // handleLeaveChannel(socket);
    });
};

/**
 *user's workspace free room to be used
 *when like sending notifications without
 *regarding to any workspace
 * @param socket connecting socket
 */
SOCKET_HANDLERS.handleIdentifySocket = function(socket) {
    socket.on(event.IDENTIFY_SOCKET, (userId) => {
        let userIdentityRoom = `user#${userId}`;
        socket.join(userIdentityRoom);
        console.log(`#user ${userId} connected`)
    });
}

/**
 * handle leave user's workspace free room
 * on sign out of account
 *  @param socket leaving socket
 */

SOCKET_HANDLERS.handleUnidentifySocket = function(socket) {
    socket.on(event.UNIDENTIFY_SOCKET, (userId) => {
        let userIdentityRoom = `user#${userId}`;
        socket.leave(userIdentityRoom);
        console.log(`#user ${userId} disconnected`)
    });
}

/**
 * joining direct message room
 * @param socket connecting socket
 */
SOCKET_HANDLERS.handleJoinDirectChatRoom = function(socket) {
        socket.on(event.JOIN_DIRECT_CHAT_ROOM, (info) => {
            let chatIdentityRom = `direct#${info.workspace_id}#${info.user_id}`;
            socket.join(chatIdentityRom);
            console.log("#User joined direct chat room: ")
            console.log(`\t${chatIdentityRom}`)
        });
    }
    /**
     * leave direct chat room
     * @param socket connecting socket
     */
SOCKET_HANDLERS.handleLeaveDirectChatRoom = function(socket) {
    socket.on(event.LEAVE_DIRECT_CHAT_ROOM, (info) => {
        let chatIdentityRom = `direct#${info.workspace_id}#${info.user_id}`;
        socket.leave(chatIdentityRom);
        console.log("#User left direct chat room: ")
        console.log(`\t${chatIdentityRom}`)
    });
}

/**
 * joining a workspace's room
 * @param socket connecting socket
 */
SOCKET_HANDLERS.handleJoinWorkspaceRoom = function(socket) {
    socket.on(event.JOIN_WORKSPACE, (workspace_id) => {
        let workspaceIdentityRoom = `workspace#${workspace_id}`;
        socket.join(workspaceIdentityRoom);
        console.log(`#user joined workspace: ${workspaceIdentityRoom}`)
    });
}

/**
 * leaving a workspace's room
 * @param socket connecting socket
 */
SOCKET_HANDLERS.handleLeaveWorkspaceRoom = function(socket) {
    socket.on(event.LEAVE_WORKSPACE, (workspace_id) => {
        let workspaceIdentityRoom = `workspace#${workspace_id}`;
        socket.leave(workspaceIdentityRoom);
        console.log(`#user left workspace: ${workspaceIdentityRoom}`)
    });
}

/**
 * handle typing status
 * @param socket typing socket
 */
SOCKET_HANDLERS.handleTypingStatus = function(socket) {
    socket.on(event.TYPING, (data) => {
        if (data.chat_type == "direct") {
            let userDirectRoom = `direct#${data.workspace_id}#${data.receiver_id}`
            socket.to(userDirectRoom).emit(event.TYPING, data)
        }
    })
}

/**
 * handle personal message
 * @param socket connecting socket
 */
SOCKET_HANDLERS.handlePersonalMessage = function(socket, io) {
    socket.on(event.PERSONAL_MESSAGE, async(personalMessage) => {
        let receiverRoom = `direct#${personalMessage.workspace_id}#${personalMessage.receiver_id}`;
        let senderRoom = `direct#${personalMessage.workspace_id}#${personalMessage.sender_id}`;
        let workspaceIdentityRoom = `workspace#${personalMessage.workspace_id}`;
        /** save this message and process it to get id */
        PersonalMessageController.addMessage(personalMessage)
            .then((message) => {
                //notify the sender that the message was not sent
                if (message == false) {
                    io.in(`user#${personalMessage.sender_id}`).emit(event.NOTIFICATION, {
                        content: "Failed to send the message"
                    })
                    console.log("#Error occured while saving DM")
                } else {
                    //check if the receiver has the contact
                    UserController.AddNewUserChatsOrUpdate(personalMessage.workspace_id, personalMessage.receiver_id, {
                            user_id: personalMessage.sender_id,
                            active: true
                        }).then(doc => {
                            if (doc != false) {
                                //to do next: notify the receiver if the new contact is added instead of updating
                                // io.in(`user#${personalMessage.receiver_id}`)
                            }
                        })
                        //to do next: add sender'info and receiver's Info
                        /**
                         * send this to sender and receiver direct messages rooms
                         */
                    msg = _.pick(message, ["_id", "sender_id", "receiver_id", "workspace_id", "content", "sent_at", "attachments"])
                    msg.replies = []
                        // io.in(workspaceIdentityRoom).emit(event.PERSONAL_MESSAGE, msg)
                    io.in(receiverRoom).emit(event.PERSONAL_MESSAGE, msg)
                    io.in(senderRoom).emit(event.PERSONAL_MESSAGE, msg)
                }
            }).catch(err => {
                io.in(`user#${personalMessage.sender_id}`).emit(event.NOTIFICATION, {
                    content: "Failed to send the message"
                })
                console.log("#Error occured while saving DM")
            })
    });
}

SOCKET_HANDLERS.handleReplyPersonalMessage = function(socket, io) {
    socket.on(event.REPLY_PERSONAL_MESSAGE, (newReply) => {
        let receiverRoom = `direct#${newReply.workspace_id}#${newReply.receiver_id}`;
        let senderRoom = `direct#${newReply.workspace_id}#${newReply.sender_id}`;
        let workspaceIdentityRoom = `workspace#${newReply.workspace_id}`;
        newReply = {
            direct_message_id: newReply.message_id,
            sender_id: newReply.sender_id,
            receiver_id: newReply.receiver_id,
            workspace_id: newReply.workspace_id,
            content: newReply.content,
            attachments: Object(newReply.attachments),
            sent_at: newReply.sent_at
        }
        personalMessageRepliesController.addNewReply(newReply)
            .then(reply => {
                if (reply == false) {
                    io.in(`user#${newReply.sender_id}`).emit(event.NOTIFICATION, {
                        content: "Failed to send the reply"
                    })
                } else {
                    let saved_reply = _.pick(reply, [
                        "_id",
                        "direct_message_id",
                        "sender_id",
                        "receiver_id",
                        "workspace_id",
                        "content",
                        "attachments",
                        "sent_at"
                    ])
                    saved_reply._id = saved_reply._id.toString()
                        // console.log(saved_reply);
                        //forward this reply
                    io.in(receiverRoom).emit(event.REPLY_PERSONAL_MESSAGE, saved_reply)
                    io.in(senderRoom).emit(event.REPLY_PERSONAL_MESSAGE, saved_reply)
                }
            }).catch(err => {
                io.in(`user#${newReply.sender_id}`).emit(event.NOTIFICATION, {
                    content: "Failed to send the reply"
                })
                console.log("#Error occured while saving DM reply", err)
            })
    });
}

/**
 * handle channel message
 * @param socket connecting socket
 */
SOCKET_HANDLERS.handleMessageBroadcasting = function(socket, io) {
    socket.on(event.MESSAGE, async(message) => {
        let workspaceIdentityRoom = `workspace#${message.workspace_id}`;
        /** save this message and process it to get id */
        MessageController.addMessage(message)
            .then(doc => {
                if (doc == false) {
                    io.in(`user#${message.sender_id}`).emit(event.NOTIFICATION, {
                        content: "Failed to send the message"
                    })
                    console.log("#Error occured while saving CM")
                } else {
                    //to do next: add sender'info
                    /**
                     * send this to workspace room
                     */
                    msg = _.pick(doc, ["_id", "sender_id", "channel_id", "workspace_id", "content", "sent_at", "attachments"])
                    msg.replies = []
                    io.in(workspaceIdentityRoom).emit(event.MESSAGE, msg)
                }
            })
    });
}

SOCKET_HANDLERS.handleReplyMessage = function(socket, io) {
    socket.on(event.REPLY_MESSAGE, (newReply) => {
        let workspaceIdentityRoom = `workspace#${newReply.workspace_id}`;
        newReply = {
            message_id: newReply.message_id,
            sender_id: newReply.sender_id,
            channel_id: newReply.channel_id,
            content: newReply.content,
            attachments: Object(newReply.attachments),
            sent_at: newReply.sent_at
        }
        messageRepliesController.addNewReply(newReply)
            .then(reply => {
                if (reply === false) {
                    io.in(`user#${newReply.sender_id}`).emit(event.NOTIFICATION, {
                        content: "Failed to send the reply"
                    })
                } else {
                    let saved_reply = _.pick(reply, [
                        "_id",
                        "message_id",
                        "sender_id",
                        "channel_id",
                        "content",
                        "attachments",
                        "sent_at"
                    ])
                    saved_reply._id = saved_reply._id.toString()
                        //forward this reply
                    io.in(workspaceIdentityRoom).emit(event.REPLY_MESSAGE, saved_reply)
                }
            })
            .catch(err => {
                io.in(`user#${newReply.sender_id}`).emit(event.NOTIFICATION, {
                    content: "Failed to send the reply"
                })
                console.log("#Error occured while saving CM reply", err)
            })
    });
}

/**
 * when a socket is disconnecting
 * @param socket socket which is disconnecting from the server
 */
SOCKET_HANDLERS.handleDisconnecting = function(socket) {
    socket.on("disconnecting", () => {
        console.log("#disconnecting ", socket.id);
    });
}

/**
 * when a socket disconnects
 * @param socket the disconnected sockect
 */
SOCKET_HANDLERS.handleDisconnect = function(socket) {
    socket.on("disconnect", () => {
        console.log(`#${socket.id} disconnected.`);
    });
}

//=================================================================











// function handleJoinSavedChannel(socket) {
//     socket.on(event.JOIN_SAVED_CHANNEL, ({ channel_id }) => {
//         console.log(`# ${socket.id} joined channel#${channel_id}`);
//         socket.join(`channel#${channel_id}`);
//     });
// }

// function handleJoinChannel(socket) {
//   socket.on(event.JOIN_NEW_CHANNEL, ({ channel, user }) => {
//     socket.join(channel.name);
//     UserController.joinChannel({ channelId: channel.id, userId: user.id })
//       .then(() => {
//         socket.emit("joinResult", {
//           success: true,
//           channel
//         });
//       })
//       .catch(console.error);
//   });
// }

// function handleLeaveChannel(socket) {
//     socket.on(event.LEAVE_CHANNEL, ({ channel, user }) => {
//         socket.leave(channel.name);
//         socket.emit("leaveResult", { success: true });
//     })
// }