const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const verifyVerifier = require("../../middleware/verifyVerifier");
const UserFullDetails = require("../../models/UserFullDetails");
const multer = require("multer");   
const upload = multer({ dest: "uploads/" });
const uploads = require("../../config/multer");

const mongoose = require("mongoose"); 


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

router.get("/verifier", verifyVerifier, async (req, res) => {
  try {
    const posts = await Post.find({}).lean();

    console.log("TOTAL POSTS FOUND:", posts.length);

    res.json(posts);
  } catch (error) {
    console.error("GET ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const posts = await Post.find({ userId }).lean(); 

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
/*
router.post("/verify/:postId", verifyVerifier, async (req, res) => {
  const { postId } = req.params;
  const { decision } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const verifier = req.verifierName; 

    
    if (!post.verifiers.includes(verifier))
      return res.status(403).json({ message: "Not authorized" });

    post.approvedBy = post.approvedBy.filter(v => v !== verifier);
    post.rejectedBy = post.rejectedBy.filter(v => v !== verifier);

    if (decision === "approved") {
      post.status = "approved";
      post.userScore += 10;
      if (!post.approvedBy.includes(verifier)) post.approvedBy.push(verifier);
    } else if (decision === "rejected") {
      post.status = "rejected";
      post.userScore -= 5;
      if (!post.rejectedBy.includes(verifier)) post.rejectedBy.push(verifier);
    }

    await post.save();
    res.status(200).json({ message: `Post ${decision}`, post });
  } catch (err) {
    console.error("Error in /verify/:postId", err);
    res.status(500).json({ message: "Server error" });
  }
});

*/

router.post("/verify/:postId", verifyVerifier, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const verifier = req.verifierName;

    if (!verifier) {
      return res.status(401).json({ message: "Verifier missing" });
    }

    const verifiers = Array.isArray(post.verifiers)
      ? post.verifiers
      : [];

    if (verifiers.length === 0) {
      return res.status(400).json({ message: "No verifiers assigned" });
    }

    if (!verifiers.includes(verifier)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    post.approvedBy = post.approvedBy || [];
    post.rejectedBy = post.rejectedBy || [];

    post.approvedBy = post.approvedBy.filter(v => v !== verifier);
    post.rejectedBy = post.rejectedBy.filter(v => v !== verifier);

    if (req.body.decision === "approved") {
      post.status = "approved";
      post.userScore = (post.userScore || 50) + 10;

      if (!post.approvedBy.includes(verifier)) {
        post.approvedBy.push(verifier);
      }
    }

    if (req.body.decision === "rejected") {
      post.status = "rejected";
      post.userScore = (post.userScore || 50) - 5;

      if (!post.rejectedBy.includes(verifier)) {
        post.rejectedBy.push(verifier);
      }
    }

    await post.save();

    return res.json({
      message: "Updated successfully",
      post
    });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
});
router.get("/userByEmail/:email", async (req, res) => {
  try {
    const user = await UserFullDetails.findOne({ email: req.params.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    

    const posts = await Post.find({ userEmail: req.params.email });

    

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