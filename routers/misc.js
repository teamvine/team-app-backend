const router = require("express").Router();
const auth = require("../passport-config");
const baseRouter = require('./baseRouter')
const Meta = require('html-metadata-parser')

router.use(auth.jwtAuth)

router.get('/get-url-metadata', (req,res)=> {
    console.log(`[${new Date()}] Get url metadata request received...`);
    if(!/([^\S]|^)(((https?\:\/\/)|(www\.))(\S+))/gi.test(req.query.url)){
        return baseRouter.error(res,200,"Invalid link");
    }
    Meta.parser(req.query.url).then(metadata=>{
        return baseRouter.success(res, 200, {metadata}, "Request successful");
    }).catch(()=> {
        return baseRouter.error(res,200,"Something went wrong or Invalid link");
    })
})

module.exports = router;