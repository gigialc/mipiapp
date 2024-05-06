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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = require("mongodb");
require("../types/session");
function mountPostEndpoints(router) {
    var _this = this;
    router.post('/posted', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var postCollection, posts, communityId, postsData, insertResult, newPost, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    postCollection = req.app.locals.postCollection;
                    posts = req.body;
                    communityId = new mongodb_1.ObjectId(posts.community_id);
                    postsData = {
                        _id: new mongodb_1.ObjectId(),
                        title: posts.title,
                        description: posts.description,
                        user: req.session.currentUser,
                        community_id: communityId,
                        comments: [],
                        likes: [],
                    };
                    return [4 /*yield*/, postCollection.insertOne(postsData)];
                case 1:
                    insertResult = _a.sent();
                    return [4 /*yield*/, postCollection.findOne({ _id: insertResult.insertedId })];
                case 2:
                    newPost = _a.sent();
                    // Other operations like updating user's communitiesCreated...
                    return [2 /*return*/, res.status(200).json({ newPost: newPost, message: "Post created successfully" })];
                case 3:
                    error_1 = _a.sent();
                    console.log(error_1);
                    return [2 /*return*/, res.status(500).json({ message: "Error creating post", error: error_1 })];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // Get all the posts from the specific community by checking the community id of all posts
    router.get('/posts1', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var postCollection, communityId, posts, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!req.session.currentUser) {
                        return [2 /*return*/, res.status(401).json({ error: 'unauthorized', message: "User needs to sign in first" })];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    postCollection = req.app.locals.postCollection;
                    communityId = new mongodb_1.ObjectId(req.query.community_id);
                    return [4 /*yield*/, postCollection.find({ community_id: communityId }).toArray()];
                case 2:
                    posts = _a.sent();
                    return [2 /*return*/, res.status(200).json({ posts: posts })];
                case 3:
                    error_2 = _a.sent();
                    console.error(error_2);
                    return [2 /*return*/, res.status(500).json({ message: "Error fetching posts", error: error_2 })];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    router.post('/comments', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var commentCollection, postId, content, commentId, commentData, updateResult, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!req.session.currentUser) {
                        return [2 /*return*/, res.status(401).json({ error: 'unauthorized', message: "User needs to sign in first" })];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    commentCollection = req.app.locals.commentCollection;
                    postId = req.body.post_id;
                    content = req.body.content;
                    commentId = new mongodb_1.ObjectId();
                    commentData = {
                        _id: commentId,
                        content: content,
                        user: req.session.currentUser,
                        createdAt: new Date(),
                        post: mongodb_1.ObjectId,
                        likes: (Array)
                    };
                    return [4 /*yield*/, commentCollection.updateOne({ _id: new mongodb_1.ObjectId(postId) }, // Ensure to convert postId to ObjectId
                        { $push: { comments: commentData } })];
                case 2:
                    updateResult = _a.sent();
                    if (updateResult.matchedCount === 0) {
                        return [2 /*return*/, res.status(404).json({ message: "Post not found" })];
                    }
                    if (updateResult.modifiedCount === 0) {
                        return [2 /*return*/, res.status(400).json({ message: "Failed to add comment" })];
                    }
                    return [2 /*return*/, res.status(200).json({ newComment: commentData, message: "Comment added successfully" })];
                case 3:
                    error_3 = _a.sent();
                    console.log(error_3);
                    return [2 /*return*/, res.status(500).json({ message: "Error adding comment", error: error_3 })];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    router.get('/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var postCollection, id, post, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    postCollection = req.app.locals.postCollection;
                    id = req.params.id;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, postCollection.findOne({ _id: new mongodb_1.ObjectId(id) })];
                case 2:
                    post = _a.sent();
                    if (!post) {
                        return [2 /*return*/, res.status(404).json({ error: 'Post not found' })];
                    }
                    console.log(post);
                    return [2 /*return*/, res.status(200).json({ title: post.title, description: post.description })];
                case 3:
                    error_4 = _a.sent();
                    console.error(error_4);
                    return [2 /*return*/, res.status(500).json({ message: "Error fetching post", error: error_4 })];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    //update likes on a post 
    router.post('/like/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var postCollection, postId, userCollection, userId, post, likeCount, likeCount, error_5;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    postCollection = req.app.locals.postCollection;
                    postId = req.params.id;
                    userCollection = req.app.locals.userCollection;
                    userId = (_a = req.session.currentUser) === null || _a === void 0 ? void 0 : _a._id;
                    console.log("postId:", postId);
                    console.log("userId:", userId);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 11, , 12]);
                    return [4 /*yield*/, postCollection.findOne({ _id: new mongodb_1.ObjectId(postId), "likes.uid": new mongodb_1.ObjectId(userId) })];
                case 2:
                    post = _b.sent();
                    if (!!post) return [3 /*break*/, 6];
                    // User hasn't liked the post yet, add like
                    return [4 /*yield*/, postCollection.updateOne({ _id: new mongodb_1.ObjectId(postId) }, { $push: { likes: { uid: new mongodb_1.ObjectId(userId) } } })];
                case 3:
                    // User hasn't liked the post yet, add like
                    _b.sent();
                    // Add post id to the user's liked array
                    return [4 /*yield*/, userCollection.updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $push: { likes: postId } })];
                case 4:
                    // Add post id to the user's liked array
                    _b.sent();
                    return [4 /*yield*/, postCollection.findOne({ _id: new mongodb_1.ObjectId(postId) })];
                case 5:
                    likeCount = _b.sent();
                    return [2 /*return*/, res.status(200).json({ isLiked: true, likeCount: likeCount.likes.length })];
                case 6: 
                // User has already liked the post, remove like
                return [4 /*yield*/, postCollection.updateOne({ _id: new mongodb_1.ObjectId(postId) }, { $pull: { likes: { uid: new mongodb_1.ObjectId(userId) } } })];
                case 7:
                    // User has already liked the post, remove like
                    _b.sent();
                    // Remove post id from the user's liked array
                    return [4 /*yield*/, userCollection.updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $pull: { likes: postId } })];
                case 8:
                    // Remove post id from the user's liked array
                    _b.sent();
                    return [4 /*yield*/, postCollection.findOne({ _id: new mongodb_1.ObjectId(postId) })];
                case 9:
                    likeCount = _b.sent();
                    return [2 /*return*/, res.status(200).json({ isLiked: false, likesCount: likeCount.likes.length })];
                case 10: return [3 /*break*/, 12];
                case 11:
                    error_5 = _b.sent();
                    console.error(error_5);
                    return [2 /*return*/, res.status(500).json({ message: "Error liking post", error: error_5 })];
                case 12: return [2 /*return*/];
            }
        });
    }); });
    // Fetch like status and count
    router.get('/like/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var postCollection, postId, userId, post, likeCount, error_6;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    postCollection = req.app.locals.postCollection;
                    postId = req.params.id;
                    userId = (_a = req.session.currentUser) === null || _a === void 0 ? void 0 : _a._id;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, postCollection.findOne({ _id: new mongodb_1.ObjectId(postId), "likes.uid": new mongodb_1.ObjectId(userId) })];
                case 2:
                    post = _b.sent();
                    return [4 /*yield*/, postCollection.findOne({ _id: new mongodb_1.ObjectId(postId) })];
                case 3:
                    likeCount = _b.sent();
                    if (post) {
                        return [2 /*return*/, res.status(200).json({ isLiked: true, likeCount: likeCount.likes.length })];
                    }
                    else {
                        return [2 /*return*/, res.status(200).json({ isLiked: false, likeCount: likeCount.likes.length })];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_6 = _b.sent();
                    console.error(error_6);
                    return [2 /*return*/, res.status(500).json({ message: "Error fetching like status", error: error_6 })];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    //fetch username of person who made the comment by finding the userid of the postcollection and comparing it to usercollection
    router.get('/username', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var postCollection, commentUserId, userCollection, userObject;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    postCollection = req.app.locals.postCollection;
                    commentUserId = req.query.user_id;
                    console.log(commentUserId);
                    userCollection = req.app.locals.userCollection;
                    return [4 /*yield*/, userCollection.findOne({ _id: new mongodb_1.ObjectId(commentUserId) })];
                case 1:
                    userObject = _a.sent();
                    console.log(userObject);
                    return [2 /*return*/, res.status(200).json({ username: userObject.username })];
            }
        });
    }); });
}
exports.default = mountPostEndpoints;
