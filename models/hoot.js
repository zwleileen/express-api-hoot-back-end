// models/hoot.js

const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const hootSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["News", "Sports", "Games", "Movies", "Music", "Television"],
    },
    //referencing:
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    //embedding:
    comments: [commentSchema],
  },
  { timestamps: true }
);

const Hoot = mongoose.model("Hoot", hootSchema);

module.exports = Hoot;
