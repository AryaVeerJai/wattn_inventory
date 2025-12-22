const mongoose = require('mongoose');

//Database Connection

const connectDatabase = () => {
    mongoose.connect(process.env.NEW_DB_LOCAL_URI, {
        
        //For avoid Warnings
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useCreateIndex: true
    }).then(con => {
        console.log(`MongoDb Database connect with HOST : ${con.connection.host}`)
    })
}

module.exports = connectDatabase 
