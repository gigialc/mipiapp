import { Router, Request, Response } from "express";
import { Types } from "mongoose";
import Comment from "../models/comments"; // Import the Comment model
import Post from "../models/posts"; // Import the Post model
import User from "../models/user"; // Import the User model
import "../types/session"; // Ensure session types are imported

export default function mountCommentEndpoints(router: Router) {

    // Add a comment to a post
    router.post('/comments', async (req: Request, res: Response) => {
        const { post_id, user_id, content } = req.body;
        const comment = {
            _id: new Types.ObjectId(),
            content,
            user: new Types.ObjectId(user_id),
            postId: new Types.ObjectId(post_id),
            likes: [],
            date: new Date()
        };

        try {
            const post = await Post.findById(post_id).exec();
            if (!post) {
                return res.status(404).json({ error: 'Not Found', message: "Post not found" });
            }
            const newComment = new Comment(comment);
            await newComment.save();
            post.comments.push(newComment._id);
            await post.save();
            return res.status(200).json({ message: "Comment added successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error adding comment", error });
        }
    });

    // Like a comment
    router.post('/likeComment/:id', async (req: Request, res: Response) => {
        const commentId = req.params.id;
        const currentUser = req.headers.user;
        const userCollection = req.app.locals.userCollection;
        const user = await userCollection.findOne({ accessToken: currentUser });
        const userId = user?._id;

        try {
            const comment = await Comment.findOne({ _id: new Types.ObjectId(commentId), "likes.uid": new Types.ObjectId(userId) }).exec();

            if (!comment) {
                // User hasn't liked the comment yet, add like
                const result = await Comment.updateOne(
                    { _id: new Types.ObjectId(commentId) },
                    { $push: { likes: { uid: new Types.ObjectId(userId) } }}
                );

                await User.updateOne(
                    { _id: new Types.ObjectId(userId) },
                    { $push: { likes: commentId } }
                );
                const updatedComment = await Comment.findById(commentId).exec();

                return res.status(200).json({ isLiked: true, likeCount: updatedComment?.likes.length });
            } else {
                // User has already liked the comment, remove like
                await Comment.updateOne(
                    { _id: new Types.ObjectId(commentId) },
                    { $pull: { likes: { uid: new Types.ObjectId(userId) } }}
                );

                await User.updateOne(
                    { _id: new Types.ObjectId(userId) },
                    { $pull: { likes: commentId } }
                );
                const updatedComment = await Comment.findById(commentId).exec();

                return res.status(200).json({ isLiked: false, likeCount: updatedComment?.likes.length });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error liking comment", error });
        }
    });

    // Fetch like status for a comment
    router.get('/likeComment/:id', async (req: Request, res: Response) => {
        const commentId = req.params.id;
        const currentUser = req.headers.user;
        const userCollection = req.app.locals.userCollection;
        const user = await userCollection.findOne({ accessToken: currentUser });
        const userId = user?._id;

        try {
            const comment = await Comment.findOne({ _id: new Types.ObjectId(commentId), "likes.uid": new Types.ObjectId(userId) }).exec();
            const likeCount = await Comment.findById(commentId).exec();

            if (comment) {
                return res.status(200).json({ isLiked: true, likeCount: likeCount?.likes.length });
            } else {
                return res.status(200).json({ isLiked: false, likeCount: likeCount?.likes.length });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching like status", error });
        }
    });

    // Fetch comments for a post
    router.get('/fetch/:id', async (req: Request, res: Response) => {
        const postId = req.params.id;

        try {
            const comments = await Comment.find({ postId: new Types.ObjectId(postId) }).exec();
            return res.status(200).json({ comments });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching comments", error });
        }
    });
}
