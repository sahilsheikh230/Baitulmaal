const mongoose=require("mongoose");
const passportLocalMongoose=require("passport-local-mongoose");
const userSchema= new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
  phone:{
    type:Number,
    required:true,
  },
  address:{
    type:String,
    required:true,
  },
  role:
   {
     type: String,
    default: 'donor'
     }
  
});
userSchema.plugin(passportLocalMongoose);
const User=mongoose.model("User",userSchema);
module.exports=User;