const Comment = require("../models/Comment");

// Create a comment
const createComment = async (req, res) => {
    try {
        const { content, postId } = req.body;

        const comment = await Comment.create({
            content,
            post: postId,
            author: req.user.id
        });

        res.status(201).json({
            message: "Comment added successfully",
            comment
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to add comment",
            error: error.message
        });
    }
};


// Get comments for a post
const getComments = async (req, res) => {
    try {
        const comments = await Comment.find({
            post: req.params.postId
        })
        .populate("author", "name")
        .sort({ createdAt: -1 });

        res.json(comments);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get comments",
            error: error.message
        });
    }
};


// Delete a comment
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can delete only your own comment"
            });
        }

        await Comment.findByIdAndDelete(req.params.id);

        res.json({
            message: "Comment deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete comment",
            error: error.message
        });
    }
};


module.exports = {
    createComment,
    getComments,
    deleteComment
};