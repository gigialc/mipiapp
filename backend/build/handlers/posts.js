"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
require("../types/session");
function mountPostEndpoints(router) {
    router.post('/posted', async (req, res) => {
        try {
            const postCollection = req.app.locals.postCollection;
            const posts = req.body;
            // Assuming community_id is directly passed and needs to be stored as ObjectId
            const communityId = new mongodb_1.ObjectId(posts.community_id); // Convert to ObjectId if it's passed as a string
            const postsData = {
                _id: new mongodb_1.ObjectId(),
                title: posts.title,
                description: posts.description,
                user: req.session.currentUser,
                community_id: communityId, // Store the community ID directly
                comments: [],
                likes: [],
            };
            const insertResult = await postCollection.insertOne(postsData);
            // Fetch the newly created post using the insertedId
            const newPost = await postCollection.findOne({ _id: insertResult.insertedId });
            // Other operations like updating user's communitiesCreated...
            return res.status(200).json({ newPost: newPost, message: "Post created successfully" });
        }
        catch (error) {
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
            const postCollection = req.app.locals.postCollection;
            const communityId = new mongodb_1.ObjectId(req.query.community_id); // Cast and convert to ObjectId
            // Directly find posts with the matching community_id
            const posts = await postCollection.find({ community_id: communityId }).toArray();
            return res.status(200).json({ posts });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching posts", error });
        }
    });
    router.post('/comments', async (req, res) => {
        if (!req.session.currentUser) {
            return res.status(401).json({ error: 'unauthorized', message: "User needs to sign in first" });
        }
        try {
            const commentCollection = req.app.locals.commentCollection;
            const postId = req.body.post_id;
            const content = req.body.content;
            //get comment id
            // Create a new ObjectId for the comment (if you're using MongoDB's built-in _id)
            const commentId = new mongodb_1.ObjectId();
            const commentData = {
                _id: commentId,
                content: content,
                user: req.session.currentUser,
                createdAt: new Date(), // Adding a timestamp for when the comment is created
                post: mongodb_1.ObjectId,
                likes: (Array)
            };
            // Update the post to include the new comment
            const updateResult = await commentCollection.updateOne({ _id: new mongodb_1.ObjectId(postId) }, // Ensure to convert postId to ObjectId
            { $push: { comments: commentData } });
            if (updateResult.matchedCount === 0) {
                return res.status(404).json({ message: "Post not found" });
            }
            if (updateResult.modifiedCount === 0) {
                return res.status(400).json({ message: "Failed to add comment" });
            }
            return res.status(200).json({ newComment: commentData, message: "Comment added successfully" });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Error adding comment", error });
        }
    });
    router.get('/:id', async (req, res) => {
        const postCollection = req.app.locals.postCollection;
        const id = req.params.id; // Make sure to require ObjectId from mongodb
        try {
            const post = await postCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            console.log(post);
            return res.status(200).json({ title: post.title, description: post.description });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching post", error });
        }
    });
    //update likes on a post 
    router.post('/like/:id', async (req, res) => {
        const postCollection = req.app.locals.postCollection;
        const postId = req.params.id;
        const userCollection = req.app.locals.userCollection;
        const userId = req.session.currentUser?._id;
        console.log("postId:", postId);
        console.log("userId:", userId);
        try {
            const post = await postCollection.findOne({ _id: new mongodb_1.ObjectId(postId), "likes.uid": new mongodb_1.ObjectId(userId) });
            if (!post) {
                // User hasn't liked the post yet, add like
                await postCollection.updateOne({ _id: new mongodb_1.ObjectId(postId) }, { $push: { likes: { uid: new mongodb_1.ObjectId(userId) } } });
                // Add post id to the user's liked array
                await userCollection.updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $push: { likes: postId } });
                const likeCount = await postCollection.findOne({ _id: new mongodb_1.ObjectId(postId) });
                return res.status(200).json({ isLiked: true, likeCount: likeCount.likes.length });
            }
            else {
                // User has already liked the post, remove like
                await postCollection.updateOne({ _id: new mongodb_1.ObjectId(postId) }, { $pull: { likes: { uid: new mongodb_1.ObjectId(userId) } } });
                // Remove post id from the user's liked array
                await userCollection.updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $pull: { likes: postId } });
                const likeCount = await postCollection.findOne({ _id: new mongodb_1.ObjectId(postId) });
                return res.status(200).json({ isLiked: false, likesCount: likeCount.likes.length });
            }
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error liking post", error });
        }
    });
    // Fetch like status and count
    router.get('/like/:id', async (req, res) => {
        const postCollection = req.app.locals.postCollection;
        const postId = req.params.id;
        const userId = req.session.currentUser?._id;
        try {
            const post = await postCollection.findOne({ _id: new mongodb_1.ObjectId(postId), "likes.uid": new mongodb_1.ObjectId(userId) });
            const likeCount = await postCollection.findOne({ _id: new mongodb_1.ObjectId(postId) });
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
    //fetch username of person who made the comment by finding the userid of the postcollection and comparing it to usercollection
    router.get('/username', async (req, res) => {
        const postCollection = req.app.locals.postCollection;
        const commentUserId = req.query.user_id;
        console.log(commentUserId);
        const userCollection = req.app.locals.userCollection;
        const userObject = await userCollection.findOne({ _id: new mongodb_1.ObjectId(commentUserId) });
        console.log(userObject);
        return res.status(200).json({ username: userObject.username });
    });
}
exports.default = mountPostEndpoints;
