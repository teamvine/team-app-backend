"use strict";

require('./mongodb/index')
const express = require("express");
const client_server = express();
const cors = require("cors");
const UserRouter = require("./routers/user");
const ChannelRouter = require("./routers/channel");
const MessagesRouter = require("./routers/messages");
const WorkspaceRouter = require("./routers/workspace");
const MiscellaneousRouter = require('./routers/misc')
const bodyParser = require('body-parser');
const settingsRouter = require('./routers/settings');
const cors_opts = {};
const history = require("connect-history-api-fallback");
const passport = require("passport");
const path = require('path');



//===============CONFIGURATION=============
// ===============client api server================
client_server.use(passport.initialize());
client_server.use(cors(cors_opts));
client_server.use(bodyParser.urlencoded({ extended: true }))
client_server.use(bodyParser.json())

// ================For Express==========
client_server.use("/public", express.static(path.join(__dirname, "/public/")));
express.static(path.join(__dirname, "/"))
client_server.use("/user", UserRouter);
client_server.use("/channel", ChannelRouter);
client_server.use("/workspace", WorkspaceRouter);
client_server.use("/message", MessagesRouter);
client_server.use("/settings", settingsRouter)
client_server.use("/misc", MiscellaneousRouter)
client_server.get("/",(req,res)=>{
    return res.send({
        status: "Working",
        message: "Server is already up & running."
    })
})
client_server.use(history());

const CLIENT_SERVER_PORT = process.env.PORT || 3000;
client_server.listen(CLIENT_SERVER_PORT, function() {
    console.log(`#CLIENT_SERVER is listening on port: ${CLIENT_SERVER_PORT}`);
});

// const { User } = require('./models/Users.mongodbShema')
// User.updateMany({profile_pic:"default_prof_pic.png"}, {$set: {picture_updated: false}}).then(docs=> console.log(docs))
