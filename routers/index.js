"use strict";

require('../mongodb/index')
const express = require("express");
const client_server = express();
const serverLess = require("serverless-http")
const cors = require("cors");
const UserRouter = require("./user");
const ChannelRouter = require("./channel");
const MessagesRouter = require("./messages")
const WorkspaceRouter = require("./workspace");
const path = require("path");
const bodyParser = require('body-parser');
const api = require("./api")
const upload = require("multer")({
    dest: "../public/images"
});
const cors_opts = {}
const history = require("connect-history-api-fallback");
const passport = require("passport");
const router = express.Router()



//===============CONFIGURATION=============
// ===============client api server================
client_server.use(passport.initialize());
client_server.use(cors(cors_opts));
client_server.use(bodyParser.urlencoded({ extended: true }))
client_server.use(bodyParser.json())

// ================For Express==========
client_server.use("/user", UserRouter);
client_server.use("/channel", ChannelRouter);
client_server.use("/workspace", WorkspaceRouter);
client_server.use("/message", MessagesRouter);
client_server.get("/",(req,res)=>{
    return res.send({
        status: "Working",
        message: "Server is already up & running."
    })
})

// ===============For netlify-lambda================
router.use("/user", UserRouter);
router.use("/channel", ChannelRouter);
router.use("/workspace", WorkspaceRouter);
router.use("/message", MessagesRouter);
router.get("/",(req,res)=>{
    return res.send({
        status: "Working",
        message: "Server is already up & running."
    })
})



client_server.use("/.netlify/functions/index", router)
client_server.use("/.netlify/functions/api",api)
client_server.use(history());




const CLIENT_SERVER_PORT = process.env.PORT || 3000;
client_server.listen(CLIENT_SERVER_PORT, function() {
    console.log(`#CLIENT_SERVER is listening on port: ${CLIENT_SERVER_PORT}`);
});


//========================FOR NETLIFY==================
module.exports = client_server
module.exports.handler = serverLess(client_server)