const mongoose = require("mongoose"); 
require("dotenv").config();

exports.dbConnect = () => {
    mongoose.connect(process.env.DATABASE_URL,{
    // ssl: true, 
    tls:true,
  }
    )
    .then(()=>console.log("DB ka connection is successful"))
    .catch((error)=>{
        console.log("Recieved an Error");
        console.error(error.message);
        process.exit(1);
    });
}