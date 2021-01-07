const router = require("express").Router()

router.get("/",(req,res)=>{
    return res.send("Hello, this is api test0")
})

module.exports = router