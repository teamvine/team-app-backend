let messages = [{
    type: "", //channel or direct-message
    receiver: {}, //channel profile or user-profile,
    messages: {
        _id: {
            _id: "",
            content: {}, //message
            replies: [
                {}
            ]
        }
    }
}]
//edisor wor
// mongoose.connect('mongodb://localhost:27017/myapp', {useNewUrlParser: true});
// mongoose.connect('mongodb://username:password@host:port/database?options...', {useNewUrlParser: true});

const _ = require('lodash')
let obj = {
    "6oHlr": { "C": "Cedric", "B": "HAHA", "ID": "6oHlr", "T": "5 hours ago", "P": "http:\/\/localhost\/cprofile\/6oHlr", "A": "\/Reps\/6oHlr\/Cedric", "R": "", "RP": "1" },
    "p7K5S": { "C": "Cedric", "B": "Hi", "ID": "p7K5S", "T": "43 minutes ago", "P": "http:\/\/localhost\/cprofile\/p7K5S", "A": "\/Reps\/p7K5S\/Cedric", "R": "", "RP": "0" },
    "4j0H6": { "C": "Cedric", "B": "hello", "ID": "4j0H6", "T": "5 hours ago", "P": "http:\/\/localhost\/cprofile\/4j0H6", "A": "\/Reps\/4j0H6\/Cedric", "R": "", "RP": "2" }
}

// let obj_len = _.size(obj) //=3

// console.log(_.snakeCase("hi there I was")) //=hi_there_i_was
// console.log(_.snakeCase("hiThere")) //=hi_there
// console.log(_.shuffle(obj)) //mix elements in an array
// console.log(_.zipObject("hello world", "hello world")) //={ h: 'h', e: 'e', l: 'l', o: 'o', ' ': ' ', w: 'w', r: 'r', d: 'd' }

// let obj_array = _.toArray(obj) // converts object to array
// console.log(_.first(obj_array)) //prints element at index 0 of array


//checkout