"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
require("../types/session");
function mountPostEndpoints(router) {
    router.post('/posted', (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const postCollection = req.app.locals.postCollection;
            const posts = req.body;
            // Assuming community_id is directly passed and needs to be stored as ObjectId
            const communityId = new mongodb_1.ObjectId(posts.community_id); // Convert to ObjectId if it's passed as a string
            const postData = {
                _id: new mongodb_1.ObjectId(),
                title: posts.title,
                description: posts.description,
                user: new mongodb_1.ObjectId((_a = req.session.currentUser) === null || _a === void 0 ? void 0 : _a._id),
                communityId: communityId,
                comments: [],
                likes: [],
                timestamp: new Date()
            };
            const insertResult = yield postCollection.insertOne(postData);
            // Fetch the newly created post using the insertedId
            const newPost = yield postCollection.findOne({ _id: insertResult.insertedId });
            // Other operations like updating user's communitiesCreated...
            return res.status(200).json({ newPost: newPost, message: "Post created successfully" });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Error creating post", error });
        }
    }));
    // Get all the posts from the specific community by checking the community id of all posts
    router.get('/posts1', (req, res) => __awaiter(this, void 0, void 0, function* () {
        if (!req.session.currentUser) {
            return res.status(401).json({ error: 'unauthorized', message: "User needs to sign in first" });
        }
        try {
            const postCollection = req.app.locals.postCollection;
            const communityId = new mongodb_1.ObjectId(req.query.community_id); // Cast and convert to ObjectId
            // Directly find posts with the matching community_id
            const posts = yield postCollection.find({ communityId: communityId }).toArray();
            return res.status(200).json({ posts });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching posts", error });
        }
    }));
    router.post('/comments', (req, res) => __awaiter(this, void 0, void 0, function* () {
        if (!req.session.currentUser) {
            return res.status(401).json({ error: 'unauthorized', message: "User needs to sign in first" });
        }
        try {
            const postCollection = req.app.locals.postCollection;
            const commentCollection = req.app.locals.commentCollection;
            const postId = req.body.post_id;
            const content = req.body.content;
            //get comment id
            // Create a new ObjectId for the comment (if you're using MongoDB's built-in _id)
            const commentId = new mongodb_1.ObjectId();
            const commentData = {
                _id: commentId,
                content: content,
                user: new mongodb_1.ObjectId(req.session.currentUser._id),
                posts: postId,
                likes: [],
                timestamp: new Date()
            };
            // Update the post to include the new comment
            const updateResult = yield commentCollection.updateOne({ _id: postId }, // Ensure to convert postId to ObjectId
            { $push: { comments: commentData._id } });
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
    }));
    router.get('/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const postCollection = req.app.locals.postCollection;
        const id = req.params.id; // Make sure to require ObjectId from mongodb
        try {
            const post = yield postCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
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
    }));
    //update likes on a post 
    router.post('/like/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _b;
        const postCollection = req.app.locals.postCollection;
        const postId = req.params.id;
        const userCollection = req.app.locals.userCollection;
        const userId = (_b = req.session.currentUser) === null || _b === void 0 ? void 0 : _b._id;
        console.log("postId:", postId);
        console.log("userId:", userId);
        try {
            const post = yield postCollection.findOne({ _id: new mongodb_1.ObjectId(postId), "likes.uid": new mongodb_1.ObjectId(userId) });
            if (!post) {
                // User hasn't liked the post yet, add like
                yield postCollection.updateOne({ _id: new mongodb_1.ObjectId(postId) }, { $push: { likes: new mongodb_1.ObjectId(userId) }
                });
                // Add post id to the user's liked array
                yield userCollection.updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $push: { likes: new mongodb_1.ObjectId(postId) } });
                const likeCount = yield postCollection.findOne({ _id: new mongodb_1.ObjectId(postId) });
                return res.status(200).json({ isLiked: true, likeCount: likeCount === null || likeCount === void 0 ? void 0 : likeCount.likes.length });
            }
            else {
                // User has already liked the post, remove like
                yield postCollection.updateOne({ _id: new mongodb_1.ObjectId(postId) }, { $pull: { likes: userId } });
                // Remove post id from the user's liked array
                yield userCollection.updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $pull: { likes: postId } });
                const likeCount = yield postCollection.findOne({ _id: new mongodb_1.ObjectId(postId) });
                return res.status(200).json({ isLiked: false, likesCount: likeCount === null || likeCount === void 0 ? void 0 : likeCount.likes.length });
            }
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error liking post", error });
        }
    }));
    // Fetch like status and count
    router.get('/like/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _c;
        const postCollection = req.app.locals.postCollection;
        const postId = req.params.id;
        const userId = (_c = req.session.currentUser) === null || _c === void 0 ? void 0 : _c._id;
        try {
            const post = yield postCollection.findOne({ _id: new mongodb_1.ObjectId(postId), "likes.uid": new mongodb_1.ObjectId(userId) });
            const likeCount = yield postCollection.findOne({ _id: new mongodb_1.ObjectId(postId) });
            if (post) {
                return res.status(200).json({ isLiked: true, likeCount: (likeCount === null || likeCount === void 0 ? void 0 : likeCount.likes.length) || 0 });
            }
            else {
                return res.status(200).json({ isLiked: false, likeCount: (likeCount === null || likeCount === void 0 ? void 0 : likeCount.likes.length) || 0 });
            }
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching like status", error });
        }
    }));
    //fetch username of person who made the comment by finding the userid of the postcollection and comparing it to usercollection
    router.get('/username', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const userCollection = req.app.locals.userCollection;
        const commentUserId = req.query.user_id;
        try {
            const userObject = yield userCollection.findOne({ _id: new mongodb_1.ObjectId(commentUserId) });
            if (!userObject) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.status(200).json({ username: userObject.username });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching username", error });
        }
    }));
}
exports.default = mountPostEndpoints;
