const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createComment,
    getComments,
    deleteComment
} = require("../controllers/commentController");


// Create comment
router.post("/", authMiddleware, createComment);


// Get comments for a post
router.get("/:postId", getComments);


// Delete comment
router.delete("/:id", authMiddleware, deleteComment);


module.exports = router;