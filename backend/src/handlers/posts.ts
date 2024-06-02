import { Router } from "express";
import { UserData } from "../types/user";
import "../types/session";
import platformAPIClient from "../services/platformAPIClient";
import { PostDocument } from "../models/posts";  // Import the PostDocument type if it's defined
import { CommentDocument } from "../models/comments";  // Import the CommentDocument type if it's defined
import { PostType } from "../types/posts";
import { CommentType } from "../types/comments";
import { Collection } from 'mongoose';
import mongoose from "mongoose";
import { Types } from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export default function mountPostEndpoints(router: Router) {

    router.post('/posted', async (req, res) => {
        try {
           const postCollection = req.app.locals.postCollection;
            const posts = req.body;
    
            const communityId = new ObjectId(posts.community_id); // Convert to ObjectId if it's passed as a string
    
            const postData : PostType = {
                _id: new ObjectId(),
                title: posts.title,
                description: posts.description,
                user: new ObjectId(req.session.currentUser?._id),
                communityId: communityId,
                comments: [],
                likes: [],
                timestamp: new Date()
            }
    
            const insertResult = await postCollection.insertOne(postData);
            const newPost = await postCollection.findOne({ _id: insertResult.insertedId });
    
            return res.status(200).json({ newPost: newPost, message: "Post created successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Error creating post", error });
        }
    });
    
    router.get('/posts1', async (req, res) => {
        if (!req.session.currentUser) {
            return res.status(401).json({ error: 'unauthorized', message: "User needs to sign in first" });
        }
    
        try {
            const postCollection = req.app.locals.postCollection;
            const communityId = new ObjectId(req.query.community_id as string); // Cast and convert to ObjectId
    
            const posts = await postCollection.find({ communityId: communityId }).toArray();
    
            return res.status(200).json({ posts });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching posts", error });
        }
    });

    router.post('/comments', async (req, res) => {
        if (!req.session.currentUser) {
            return res.status(401).json({ error: 'unauthorized', message: "User needs to sign in first" });
        }
        try {
            const postCollection = req.app.locals.postCollection as Collection<PostType>;
            const commentCollection = req.app.locals.commentCollection as Collection<CommentType>;
            const postId = new ObjectId(req.body.post_id); // Convert to ObjectId
            const content = req.body.content;
    
            const commentId = new ObjectId();
    
            const commentData: CommentType = {
                _id: commentId,
                content: content,
                user: new ObjectId(req.session.currentUser._id),
                posts: postId,
                likes: [],
                timestamp: new Date()
            };
    
            const updateResult = await postCollection.updateOne(
                { _id: postId },
                { $push: { comments: commentData._id } }
            );
    
            if (updateResult.matchedCount === 0) {
                return res.status(404).json({ message: "Post not found" });
            }
    
            await commentCollection.insertOne(commentData);
    
            return res.status(200).json({ newComment: commentData, message: "Comment added successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Error adding comment", error });
        }
    });

    router.get('/:id', async (req, res) => {
        const postCollection = req.app.locals.postCollection as Collection<PostType>;
        const id = req.params.id; // Make sure to require ObjectId from mongodb
        try {
          const post = await postCollection.findOne({ _id: new ObjectId(id) });
          if (!post) {
            return res.status(404).json({ error: 'Post not found' });
          }
          console.log(post);
          return res.status(200).json({ title: post.title, description: post.description });

        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Error fetching post", error });
        }
    });

    router.post('/like/:id', async (req, res) => {
        const postCollection = req.app.locals.postCollection as Collection<PostType>;
        const postId = new ObjectId(req.params.id);
        const userCollection = req.app.locals.userCollection as Collection<UserData>;
        const userId = new ObjectId(req.session.currentUser?._id);
        console.log("postId:", postId);
        console.log("userId:", userId);

        try {
            const post = await postCollection.findOne({ _id: postId, likes: userId });
            
            if (!post) {
                await postCollection.updateOne(
                    { _id: postId },
                    { $push: { likes: userId } }
                );
    
                await userCollection.updateOne(
                    { _id: userId },
                    { $push: { likes: postId } }
                );
                const likeCount = await postCollection.findOne({ _id: postId });
            
                return res.status(200).json({ isLiked: true, likeCount: likeCount?.likes.length });
            } else {
                await postCollection.updateOne(
                    { _id: postId },
                    { $pull: { likes: userId } }
                );
    
                await userCollection.updateOne(
                    { _id: userId },
                    { $pull: { likes: postId } }
                );
                const likeCount = await postCollection.findOne({ _id: postId });
                
                return res.status(200).json({ isLiked: false, likeCount: likeCount?.likes.length });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error liking post", error });
        }
    });

    router.get('/like/:id', async (req, res) => {
        const postCollection = req.app.locals.postCollection as Collection<PostType>;
        const postId = new ObjectId(req.params.id);
        const userId = new ObjectId(req.session.currentUser?._id);
    
        try {
            const post = await postCollection.findOne({ _id: postId, likes: userId });
            const likeCount = await postCollection.findOne({ _id: postId });
    
            if (post) {
                return res.status(200).json({ isLiked: true, likeCount: likeCount?.likes.length || 0 });
            } else {
                return res.status(200).json({ isLiked: false, likeCount: likeCount?.likes.length || 0 });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching like status", error });
        }
    });

    router.get('/username', async (req, res) => {
        const userCollection = req.app.locals.userCollection as Collection<UserData>;
        const commentUserId = new ObjectId(req.query.user_id as string);

        try {
            const userObject = await userCollection.findOne({ _id: commentUserId });
            if (!userObject) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.status(200).json({ username: userObject.username });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching username", error });
        }
    });

}
