const mongoose=require("mongoose");
const passportLocalMongoose=require("passport-local-mongoose");
const adminschema=new mongoose.Schema({
username:{
    type:String,
    required:true,
},
phone:{
    type:Number,
    required:true,

},
role: 
{ type: String,
    
    default: 'admin'
 }




});
adminschema.plugin(passportLocalMongoose);
 const Admin=mongoose.model("Admin",adminschema);
 module.exports=Admin; 