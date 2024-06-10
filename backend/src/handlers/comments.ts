import { Router, Request, Response } from "express";
import { Types } from "mongoose";
import Comment from "../models/comments"; // Import the Comment model
import Post from "../models/posts"; // Import the Post model
import User from "../models/user"; // Import the User model
import "../types/session"; // Ensure session types are imported
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, authenticateToken } from '../Middleware/auth';
import mongoose from "mongoose";

const router = Router();
const JWT_SECRET =  process.env.JWT_SECRET || 'UaIh0qWFOiKOnFZmyuuZ524Jp74E7Glq';

const ObjectId = mongoose.Types.ObjectId;

export default function mountCommentEndpoints(router: Router) {

    // Add a comment to a post
    router.post('/comments', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
        const { post_id, user_id, content } = req.body;
        const userCollection = req.app.locals.userCollection;
        const currentUser = req.user;
        const userId = currentUser?._id;

        try {
            const comment = new Comment({
                post_id: new Types.ObjectId(post_id),
                user_id: new Types.ObjectId(userId),
                content,
                likes: [],
                timestamp: new Date()
            });

            await comment.save();

            await Post.updateOne(
                { _id: new Types.ObjectId(post_id) },
                { $push: { comments: comment._id } }
            );

            await User.updateOne(
                { _id: new Types.ObjectId(userId) },
                { $push: { comments: comment._id } }
            );

            return res.status(200).json({ message: "Comment added successfully", comment });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error adding comment", error });
        }
    });

    // Like a comment
    router.post('/likeComment/:id',authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
        const commentId = req.params.id;
        const userCollection = req.app.locals.userCollection;
        const currentUser = req.user;
        const userId = currentUser?._id;

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
    router.get('/likeComment/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
        const commentId = req.params.id;
        const currentUser = req.user;
        const userCollection = req.app.locals.userCollection;
        const userId = currentUser?._id;

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
    router.get('/fetch/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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
