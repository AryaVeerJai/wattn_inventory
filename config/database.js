const mongoose = require('mongoose');

//Database Connection
//mongodb://localhost:27017/tanziva
//mongodb+srv://websharkdeveloper:<password>@cluster0.vrkzeyq.mongodb.net/tanziva?retryWrites=true&w=majority
const connectDatabase = () => {
    // mongoose.connect("mongodb+srv://jai:jai1234@clusterwattninventory.llsgj.mongodb.net/InventoryMaterials?retryWrites=true&w=majority&appName=ClusterWattnInventory/InventoryMaterials", {
    mongoose.connect("mongodb://jai_db_user:83aiYLrHUpWiGMQ2@ac-guz6op5-shard-00-00.dbdpx9i.mongodb.net:27017,ac-guz6op5-shard-00-01.dbdpx9i.mongodb.net:27017,ac-guz6op5-shard-00-02.dbdpx9i.mongodb.net:27017/InventoryAdminDB?ssl=true&replicaSet=atlas-89v3w5-shard-0&authSource=admin&appName=wattninventryadmin", {
        
        //For avoid Warnings
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useCreateIndex: true
    }).then(con => {
        console.log(`MongoDb Database connect with HOST : ${con.connection.host}`)
    })
}

module.exports = connectDatabase 
