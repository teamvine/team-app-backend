let passport = require("passport");
const jwt = require("jsonwebtoken");
const secretOrKey = process.env.PASSPORT_SECRET || "secretOrKey";
const baseROuter = require("./routers/baseRouter")

// Export module
const auth = {};

auth.createToken = (user) => {
    let payload = {
        user_id: user._id,
        workspace_id: "", //if not empty so the user switched workspaces
    };
    return jwt.sign(payload, secretOrKey);
};


auth.passport = passport;

auth.verifyToken = (token) => {
    return jwt.verify(token, secretOrKey);
};

auth.switchWorkspace = (token, workspace) => {
    let decoded = auth.verifyToken(token);
    decoded.workspace_id = workspace._id
    return jwt.sign(decoded, secretOrKey);
}

auth.jwtAuth = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (authorization && authorization.split(" ")[0] === "Bearer") {
        let decoded = auth.verifyToken(authorization.split(" ")[1]);
        if (!decoded || !decoded.user_id || decoded.user_id == "") {
            return baseROuter.error(res, 401, "Unauthorized access!")
        } else {
            return next()
        }
    } else {
        return baseROuter.error(res, 401, "Unauthorized access!")
    }
};

module.exports = auth;