const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const verifyVerifier = require("../../middleware/verifyVerifier");
const UserFullDetails = require("../../models/UserFullDetails");
const multer = require("multer");   
const upload = multer({ dest: "uploads/" });
const uploads = require("../../config/multer");


const mongoose = require("mongoose"); 
const getAIReputationScore = require("../../utils/aiReputation");

/*
router.post("/create", uploads.single("file"), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const {
      title,
      description,
      category,
      tags,
      fromDate,
      toDate,
      duration,
      location,
      city,
      feedback,
      proofLink,
      userId,
      userName,
      userEmail,
      verifiers
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "UserId is required" });
    }

   const finalVerifiers =
  typeof verifiers === "string"
    ? verifiers.split(",").map(v => v.trim())
    : Array.isArray(verifiers)
    ? verifiers
    : [];

    const post = new Post({
      title,
      description,
      category: category || "",
tags: tags || "",

      fromDate: fromDate || null,
      toDate: toDate || null,
      duration,

      location: location || "",
city: city || "",

      feedback: feedback || "",
proofLink: proofLink || "",


      


file: req.file ? `http://localhost:5000/uploads/${req.file.filename}` : "",

      

      userId: userId,

      userName,
      userEmail,

      verifiers: finalVerifiers
    });

    const savedPost = await post.save();

    console.log("SAVED:", savedPost);
   

    res.json({ message: "Post created successfully", savedPost });

  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

*/
/*
router.post("/create", uploads.single("file"), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const {
      title,
      description,
      category,
      tags,
      fromDate,
      toDate,
      duration,
      location,
      city,
      feedback,
      proofLink,
      userId,
      userName,
      userEmail,
      verifiers
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "UserId is required" });
    }

    const finalVerifiers = Array.isArray(verifiers)
      ? verifiers
      : typeof verifiers === "string"
      ? verifiers.split(",").map(v => v.trim())
      : [];

    const post = new Post({
      title: title || "",
      description: description || "",
      category: category || "",

      tags: typeof tags === "string"
        ? tags.split(",").map(t => t.trim())
        : Array.isArray(tags)
        ? tags
        : [],

      fromDate: fromDate ? new Date(fromDate) : null,
      toDate: toDate ? new Date(toDate) : null,

      duration: duration || "",

      location: location || "",
      city: city || "",

      feedback: feedback || "",
      proofLink: proofLink || "",

      file: req.file
        ? `http://localhost:5000/uploads/${req.file.filename}`
        : "",

      userId,
      userName: userName || "",
      userEmail: userEmail || "",

      verifiers: finalVerifiers,

      status: "pending",
      approvedBy: [],
      rejectedBy: []
    });

    const savedPost = await post.save();

    console.log("SAVED:", savedPost);

    return res.status(201).json({
      message: "Post created successfully",
      savedPost
    });

  } catch (err) {
    console.error("CREATE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

*/


router.post("/create", uploads.single("file"), async (req, res) => {
  try {
    const {
      userId,
      title,
      description,
      category,
      tags,
      fromDate,
      toDate,
      feedback,
      location,
      city,
      proofLink,
      verifiers,
      userName,
      userEmail
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "UserId required" });
    }

    const user = await UserFullDetails.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cleanTags =
      typeof tags === "string"
        ? tags.split(",").map(t => t.trim())
        : Array.isArray(tags)
        ? tags
        : [];

    const finalVerifiers =
      typeof verifiers === "string"
        ? verifiers.split(",").map(v => v.trim())
        : Array.isArray(verifiers)
        ? verifiers
        : [];

    let post = new Post({
      userId,
      userName,
      userEmail,
      title: title || "",
      description: description || "",
      category: category || "",
      tags: cleanTags,
      fromDate: fromDate ? new Date(fromDate) : null,
      toDate: toDate ? new Date(toDate) : null,
      feedback: feedback || "",
      location: location || "",
      city: city || "",
      proofLink: proofLink || "",
      file: req.file
        ? `http://localhost:5000/uploads/${req.file.filename}`
        : "",
      verifiers: finalVerifiers,
      approvedBy: [],
      rejectedBy: [],
      status: "pending",
      aiScoreGiven: false,
      aiReputationScore: 0,
      finalScore: 0
    });

    
    await post.save();

    
    

    
    return res.status(201).json({
      message: "Post created successfully (AI scoring in progress)",
      post
    });

  } catch (err) {
    console.error("CREATE ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
});



router.get("/verifier", verifyVerifier, async (req, res) => {
  try {
    const posts = await Post.find({}).lean();

    const userIds = posts
      .map(p => p.userId)
      .filter(Boolean);

    const users = await UserFullDetails.find({
      _id: { $in: userIds }
    }).lean();

    const userMap = {};

    users.forEach(u => {
      userMap[u._id.toString()] = u.reputationScore || 0;
    });

    const enrichedPosts = posts.map(p => ({
      ...p,
      reputationScore: userMap[p.userId?.toString()] ?? 0
    }));

    return res.json(enrichedPosts);
  } catch (error) {
    console.error("VERIFIER ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const posts = await Post.find({ userId }).lean(); 

    const user = await UserFullDetails.findById(userId);
    if(!user){
      return res.status(404).json({message:"user not found"});
    }

    res.json({
      posts,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



router.post("/verify/:postId", verifyVerifier, async (req, res) => {
  try {
    const { postId } = req.params;
    const { decision } = req.body;

    
    if (!decision) {
      return res.status(400).json({ message: "Decision is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user=await UserFullDetails.findById(post.userId);
    if(!user){
      return res.status(404).json({message:"user not found"});
    }

    const verifier = req.verifierName;
    if (!verifier) {
      return res.status(401).json({ message: "Verifier missing" });
    }

   
    if (!Array.isArray(post.verifiers)) post.verifiers = [];
    if (!Array.isArray(post.approvedBy)) post.approvedBy = [];
    if (!Array.isArray(post.rejectedBy)) post.rejectedBy = [];

    
    const allowed = post.verifiers
      .map(v => v.toLowerCase())
      .includes(verifier.toLowerCase());

    if (!allowed) {
      return res.status(403).json({ message: "Not authorized" });
    }

    
    post.approvedBy = post.approvedBy.filter(v => v !== verifier);
    post.rejectedBy = post.rejectedBy.filter(v => v !== verifier);

    
    if (decision === "approved") {
  if (!post.approvedBy.includes(verifier)) {
    post.approvedBy.push(verifier);
  }

  post.rejectedBy = post.rejectedBy.filter(v => v !== verifier);

  const allApproved =
    post.approvedBy.length === post.verifiers.length &&
    post.verifiers.length > 0;

 /* if (allApproved && post.status !== "approved") {
    post.status = "approved";
    user.reputationScore += 10;
  }
    */

  if (allApproved && post.status !== "approved") {
  post.status = "approved";

  
  user.reputationScore += 10;

 
  
}

} else if (decision === "rejected") {
  if (!post.rejectedBy.includes(verifier)) {
    post.rejectedBy.push(verifier);
  }


  
  post.approvedBy = post.approvedBy.filter(v => v !== verifier);

/*  post.status = "rejected";
  user.reputationScore -= 5;
  */

  post.status = "rejected";


user.reputationScore -= 5;





}
    await post.save();
    await user.save();

    res.json({ message: "Updated successfully", post });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


router.get("/userByEmail/:email", async (req, res) => {
  try {
    const user = await UserFullDetails.findOne({ email: req.params.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    

    const posts = await Post.find({ userEmail: req.params.email }).lean();

      console.log("ALL POSTS COUNT:", posts.length);
     console.log(posts.map(p => ({
  title: p.title,
  userId: p.userId
})));

    return res.json({ user, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router; 