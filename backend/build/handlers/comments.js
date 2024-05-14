"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
require("../types/session");
//comment collection
function mountCommentEndpoints(router) {
    //check if user is already in the community
    router.post('/comments', async (req, res) => {
        const postCollection = req.app.locals.postCollection;
        const commentCollection = req.app.locals.commentCollection;
        const id = req.body.post_id;
        console.log(id);
        const user = req.body.user_id;
        console.log(user);
        const comment = {
            _id: new mongodb_1.ObjectId(),
            content: req.body.content,
            user: user,
            postId: id,
            likes: [],
            Date: new Date()
        };
        console.log(comment);
        try {
            const post = await postCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
            if (!post) {
                return res.status(404).json({ error: 'Not Found', message: "Post not found" });
            }
            await commentCollection.insertOne(comment);
            await postCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $push: { comments: comment._id } });
            return res.status(200).json({ message: "Comment added successfully" });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error adding comment", error });
        }
    });
    //like a comment 
    router.post('/likeComment/:id', async (req, res) => {
        const commentCollection = req.app.locals.commentCollection;
        const userCollection = req.app.locals.userCollection;
        const commentId = req.params.id;
        const userId = req.session.currentUser?._id;
        console.log("CommentId:", commentId);
        console.log("userId:", userId);
        try {
            const post = await commentCollection.findOne({ _id: new mongodb_1.ObjectId(commentId), "likes.uid": new mongodb_1.ObjectId(userId) });
            if (!post) {
                // User hasn't liked the comment yet, add like
                const result = await commentCollection.updateOne({ _id: new mongodb_1.ObjectId(commentId) }, { $push: { likes: { uid: new mongodb_1.ObjectId(userId) } } });
                // Add post id to the user's liked array
                await userCollection.updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $push: { likes: commentId } });
                const likeCount = await commentCollection.findOne({ _id: new mongodb_1.ObjectId(commentId) });
                return res.status(200).json({ isLiked: true, likeCount: likeCount.likes.length });
            }
            else {
                // User has already liked the comment, remove like
                await commentCollection.updateOne({ _id: new mongodb_1.ObjectId(commentId) }, { $pull: { likes: { uid: new mongodb_1.ObjectId(userId) } } });
                // Remove post id from the user's liked array
                await userCollection.updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $pull: { likes: commentId } });
                const likeCount = await commentCollection.findOne({ _id: new mongodb_1.ObjectId(commentId) });
                return res.status(200).json({ isLiked: false, likesCount: likeCount.likes.length });
            }
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error liking comment", error });
        }
    });
    // Fetch like status for a comment
    router.get('/likeComment/:id', async (req, res) => {
        const commentCollection = req.app.locals.commentCollection;
        const postId = req.params.id;
        const userId = req.session.currentUser?._id;
        try {
            const post = await commentCollection.findOne({ _id: new mongodb_1.ObjectId(postId), "likes.uid": new mongodb_1.ObjectId(userId) });
            const likeCount = await commentCollection.findOne({ _id: new mongodb_1.ObjectId(postId) });
            if (post) {
                return res.status(200).json({ isLiked: true, likeCount: likeCount.likes.length });
            }
            else {
                return res.status(200).json({ isLiked: false, likeCount: likeCount.likes.length });
            }
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching like status", error });
        }
    });
    //fetch the comments
    router.get('/fetch/:id', async (req, res) => {
        const commentCollection = req.app.locals.commentCollection;
        const postId = req.params.id;
        console.log(postId);
        try {
            const comments = await commentCollection.find({ postId: postId }).toArray();
            return res.status(200).json({ comments });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching comments", error });
        }
    });
}
exports.default = mountCommentEndpoints;
