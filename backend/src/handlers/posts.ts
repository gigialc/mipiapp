import { Router } from "express";
import { ObjectId } from "mongodb";
import { CommunityType } from "../types/community";
import { UserData } from "../types/user";
import "../types/session";
import platformAPIClient from "../services/platformAPIClient";
import { PostDocument } from "../models/posts";  // Import the PostDocument type if it's defined
import { CommentDocument } from "../models/comments";  // Import the CommentDocument type if it's defined
import { PostType } from "../types/posts";
import { CommentType } from "../types/comments";
import { Collection } from "mongodb";

export default function mountPostEndpoints(router: Router) {

    router.post('/posted', async (req, res) => {
        try {
            const postCollection = req.app.locals.postCollection as Collection<PostType>;
            const posts = req.body;
    
            // Assuming community_id is directly passed and needs to be stored as ObjectId
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
            // Fetch the newly created post using the insertedId
            const newPost = await postCollection.findOne({ _id: insertResult.insertedId });
    
            // Other operations like updating user's communitiesCreated...
            return res.status(200).json({ newPost: newPost, message: "Post created successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Error creating post", error });
        }
    });
    
    // Get all the posts from the specific community by checking the community id of all posts
    router.get('/posts1', async (req, res) => {
        if (!req.session.currentUser) {
            return res.status(401).json({ error: 'unauthorized', message: "User needs to sign in first" });
        }
    
        try {
            const postCollection = req.app.locals.postCollection as Collection<PostType>;
            const communityId = new ObjectId(req.query.community_id as string); // Cast and convert to ObjectId
    
            // Directly find posts with the matching community_id
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
            const postId = req.body.post_id;
            const content = req.body.content;
            //get comment id
    
            // Create a new ObjectId for the comment (if you're using MongoDB's built-in _id)
            const commentId = new ObjectId();
    
            const commentData: CommentType = {
                _id: commentId,
                content: content,
                user: new ObjectId(req.session.currentUser._id),
                posts: postId,
                likes: [],
                timestamp: new Date()
            };
    
            // Update the post to include the new comment
            const updateResult = await commentCollection.updateOne(
                { _id: postId }, // Ensure to convert postId to ObjectId
                { $push: { comments: commentData._id } }
            );
    
            if (updateResult.matchedCount === 0) {
                return res.status(404).json({ message: "Post not found" });
            }
    
            if (updateResult.modifiedCount === 0) {
                return res.status(400).json({ message: "Failed to add comment" });
            }
    
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

    //update likes on a post 
    router.post('/like/:id', async (req, res) => {
        const postCollection = req.app.locals.postCollection as Collection<PostType>;
        const postId = req.params.id;
        const userCollection = req.app.locals.userCollection as Collection<UserData>;
        const userId = req.session.currentUser?._id;
        console.log("postId:", postId);
        console.log("userId:", userId);

        try {
            const post = await postCollection.findOne({ _id: new ObjectId(postId), "likes.uid": new ObjectId(userId) });
            
            if (!post) {
                // User hasn't liked the post yet, add like
                await postCollection.updateOne(
                    { _id: new ObjectId(postId) },
                    { $push: { likes: new ObjectId(userId) } 
                }
                );
    
                // Add post id to the user's liked array
                await userCollection.updateOne(
                    { _id: new ObjectId(userId) },
                    { $push: { likes: new ObjectId(postId) } }
                );
                const likeCount = await postCollection.findOne({ _id: new ObjectId(postId) });
            
                return res.status(200).json({ isLiked: true, likeCount: likeCount?.likes.length});
            } else {
                // User has already liked the post, remove like
                await postCollection.updateOne(
                    { _id: new ObjectId(postId) },
                    { $pull: { likes: userId } }
                );
    
                // Remove post id from the user's liked array
                await userCollection.updateOne(
                    { _id: new ObjectId(userId) },
                    { $pull: { likes: postId } }
                );
                const likeCount = await postCollection.findOne({ _id: new ObjectId(postId) });
                
               
                return res.status(200).json({ isLiked: false , likesCount: likeCount?.likes.length});
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error liking post", error });
        }
    });

    // Fetch like status and count
    router.get('/like/:id', async (req, res) => {
        const postCollection = req.app.locals.postCollection as Collection<PostType>;
        const postId = req.params.id;
        const userId = req.session.currentUser?._id;
    
        try {
            const post = await postCollection.findOne({ _id: new ObjectId(postId), "likes.uid": new ObjectId(userId) });
            const likeCount = await postCollection.findOne({ _id: new ObjectId(postId) });
    
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

    //fetch username of person who made the comment by finding the userid of the postcollection and comparing it to usercollection
    router.get('/username', async (req, res) => {
        const userCollection = req.app.locals.userCollection as Collection<UserData>;
        const commentUserId = req.query.user_id as string;

        try {
            const userObject = await userCollection.findOne({ _id: new ObjectId(commentUserId) });
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
