const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');

// production! mongodb atlas
const connection = mongoose.connect('mongodb+srv://egide:8QVEpKfW8r2UVPsw@devdbs.xcnlk.gcp.mongodb.net/teamDb?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("#Connected to mongodb successfully...")
}).catch(() => {
    console.log("#Failed to connect to mongodb...")
})

// development! localhost mongodb
// const connection = mongoose.connect('mongodb://localhost:27017/teamDb', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(()=>{
//     console.log("#Connected to mongodb successfully...")
// }).catch(()=>{
//     console.log("#Failed to connect to mongodb...")
// })

// console.log(bcrypt.hashSync("123456",2))
// console.log(Date())