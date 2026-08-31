const mongoose = require("mongoose")

const dbConnect = async ()=> {

    try{

        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME
        })

        console.log("Database connected successfully")

    }catch(err){

        console.log(`Database connection error: ${err.message}`)

    }
}

module.exports = dbConnect