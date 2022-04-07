const mongoose = require("mongoose");
const urlSchema = new mongoose.Schema({
   urlCode:{
       type:String,
     
   },
   longUrl:{
       type:String,
       required:"longUrl is required",
       trim:true,
   },
   shortUrl:{
       type:String,
       trim:true,
       unique:true
   }    
})
module.exports = mongoose.model("Url",urlSchema)









