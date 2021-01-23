const router = require('express').Router()

router.get('/',(req,res)=>{
    return res.send('seetings')
})

module.exports = router