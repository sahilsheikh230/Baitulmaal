
    const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const baitulmaalSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email:{
    type:String,
    required:true,
    unique:true,
  },
  address:{
    type:String,
    required:true,
  },
document:{
     url:String,
 filename:String,

},
aadhaarCard: {
    url: String,
    filename: String,
  },

  liveWithAadhaar: {
    url: String,
    filename: String,
  },
references:{
    type:String,
    required:true,
},
phone:{
    type:Number,
    required:true,
    unique:true,

},
isverified:{
    type:Boolean,
    default:false,
},
 status: {
    type: String,
    enum: ['Submitted', 'UnderReview', 'Contacted', 'Approved', 'Rejected'],
    default: 'Submitted',
  },
phoneVerified:{
  type:Boolean,
  required:true,
  default:false,
},
emailVerified:{
  type:Boolean,
  required:true,
  default:false,
}
  
});

baitulmaalSchema.plugin(passportLocalMongoose, {
  usernameField: 'name'  
});

const Baitulmaal = mongoose.model('Baitulmaal', baitulmaalSchema);
module.exports = Baitulmaal;
