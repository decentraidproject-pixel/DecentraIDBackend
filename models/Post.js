const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({

  
  
  title: String,
  description: String,
  category: String,
  tags: [String],
  

  
  fromDate: Date,
  toDate: Date,
  duration: String,

  
  location: String,
  city: String,

  
  feedback: String,

  
  proofLink: String,
  file: String, 

  
 
  userName: String,
  userEmail: String,

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserFullDetails" },
  verifiers: [String],

 
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  approvedBy: { type: [String], default: [] },
  rejectedBy: { type: [String], default: [] },

 
  userScore: { type: Number, default: 50 },
  aiScoreGiven: {
  type: Boolean,
  default: false
},
aiReputationScore: {
  type: Number,
  default: 0
},
finalScore: {
  type: Number,
  default: 0
}

}, { timestamps: true });

module.exports = mongoose.model("posts", postSchema);
