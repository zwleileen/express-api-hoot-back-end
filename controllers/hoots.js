// controllers/hoots.js

const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Hoot = require("../models/hoot.js");
const router = express.Router();

// add routes here

module.exports = router;

router.post("/", verifyToken, async (req, res) => {
  try {
    req.body.author = req.user._id; //append user.id to body.author, which updates the form data that will be used to create the resource and ensure logged in user is marked as author
    const hoot = await Hoot.create(req.body); //req.body based on hootSchema
    hoot._doc.author = req.user;
    res.status(201).json(hoot);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const hoots = await Hoot.find({})
      .populate("author")
      .sort({ createdAt: "desc" });
    res.status(200).json(hoots);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// router.get("/:hootId", verifyToken, async (req, res) => {
//   try {
//     const hoot = await Hoot.findById(req.params.hootId).populate("author");
//     res.status(200).json(hoot);
//   } catch (err) {
//     res.status(500).json({ err: err.message });
//   }
// });

router.put("/:hootId", verifyToken, async (req, res) => {
  try {
    // Find the hoot:
    const hoot = await Hoot.findById(req.params.hootId);

    // Check permissions:
    if (!hoot.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }

    // Update hoot:
    const updatedHoot = await Hoot.findByIdAndUpdate(
      req.params.hootId,
      req.body,
      { new: true }
    );

    // Append req.user to the author property:
    updatedHoot._doc.author = req.user;

    // Issue JSON response:
    res.status(200).json(updatedHoot);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// controllers/hoots.js

router.delete("/:hootId", verifyToken, async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId);

    if (!hoot.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }

    const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId);
    res.status(200).json(deletedHoot);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// controllers/hoots.js

router.post("/:hootId/comments", verifyToken, async (req, res) => {
  try {
    req.body.author = req.user._id;
    const hoot = await Hoot.findById(req.params.hootId);
    hoot.comments.push(req.body); //req.body based on commentSchema
    await hoot.save();

    // Find the newly created comment:
    const newComment = hoot.comments[hoot.comments.length - 1];

    newComment._doc.author = req.user;

    // Respond with the newComment:
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// controllers/hoots.js

router.get("/:hootId", verifyToken, async (req, res) => {
  try {
    // populate author of hoot and comments
    const hoot = await Hoot.findById(req.params.hootId).populate([
      "author",
      "comments.author",
    ]);
    res.status(200).json(hoot);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// controllers/hoots.js

router.put("/:hootId/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId);
    const comment = hoot.comments.id(req.params.commentId);

    // ensures the current user is the author of the comment, comment.author retrieves the id only instead of both id and name since we populated it in .get because each route doesn't carry over to another route and when we retrieve the hoot doc, we always retrieve the raw one
    if (comment.author.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this comment" });
    }

    comment.text = req.body.text;
    await hoot.save();
    res.status(200).json({ message: "Comment updated successfully" });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// controllers/hoots.js

router.delete("/:hootId/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId);
    const comment = hoot.comments.id(req.params.commentId);

    // ensures the current user is the author of the comment
    if (comment.author.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this comment" });
    }

    hoot.comments.remove({ _id: req.params.commentId });
    await hoot.save();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});
