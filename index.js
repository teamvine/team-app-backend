"use strict";

// =======IMPORT AND INITIALIZE ALL REQUIRED MODULES==========
require('./mongodb/index')
const express = require("express");
const client_server = express();
const CLIENT_SERVER = require("http").createServer(client_server);
const cors = require("cors");
const UserRouter = require("./routers/user");
const ChannelRouter = require("./routers/channel");
const MessagesRouter = require("./routers/messages")
const WorkspaceRouter = require("./routers/workspace");
const path = require("path");
const bodyParser = require('body-parser');
const upload = require("multer")({
    dest: "./public/images"
});
const cors_opts = {}
const history = require("connect-history-api-fallback");
const passport = require("passport");
// ===========================================




//===============CONFIGURATION=============
// ===============client api server================
client_server.use(passport.initialize());
client_server.use(cors(cors_opts));
client_server.use(bodyParser.urlencoded({ extended: true }))
client_server.use(bodyParser.json())
client_server.use('/client', express.static("client/dist"));
client_server.use("/public", express.static(path.join(__dirname, "/public/")));
express.static(path.join(__dirname, "/"))
client_server.use("/user", UserRouter);
client_server.use("/channel", ChannelRouter);
client_server.use("/workspace", WorkspaceRouter);
client_server.use("/message", MessagesRouter);
client_server.get("",(req,res)=>{
    return res.send({
        status: "Working",
        message: "Server is already up & running."
    })
})
client_server.use(history());




//==========ATTACH SERVERS ON PORTS=========
const CLIENT_SERVER_PORT = process.env.PORT || 3000;
CLIENT_SERVER.listen(CLIENT_SERVER_PORT, function() {
    console.log(`#CLIENT_SERVER is listening on port: ${CLIENT_SERVER_PORT}`);
});
// ==========================================