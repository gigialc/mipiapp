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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
//comment collection
function mountCommentEndpoints(router) {
    var _this = this;
    //check if user is already in the community
    router.post('/comments', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var postCollection, commentCollection, id, user, comment, post, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    postCollection = req.app.locals.postCollection;
                    commentCollection = req.app.locals.commentCollection;
                    id = req.body.post_id;
                    console.log(id);
                    user = req.body.user_id;
                    console.log(user);
                    comment = {
                        _id: new mongodb_1.ObjectId(),
                        content: req.body.content,
                        user: user,
                        postId: id,
                        likes: [],
                        Date: new Date()
                    };
                    console.log(comment);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, postCollection.findOne({ _id: new mongodb_1.ObjectId(id) })];
                case 2:
                    post = _a.sent();
                    if (!post) {
                        return [2 /*return*/, res.status(404).json({ error: 'Not Found', message: "Post not found" })];
                    }
                    return [4 /*yield*/, commentCollection.insertOne(comment)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, postCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $push: { comments: comment._id } })];
                case 4:
                    _a.sent();
                    return [2 /*return*/, res.status(200).json({ message: "Comment added successfully" })];
                case 5:
                    error_1 = _a.sent();
                    console.error(error_1);
                    return [2 /*return*/, res.status(500).json({ message: "Error adding comment", error: error_1 })];
                case 6: return [2 /*return*/];
            }
        });
    }); });
    //like a comment 
    router.post('/likeComment/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var commentCollection, userCollection, commentId, userId, post, result, likeCount, likeCount, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    commentCollection = req.app.locals.commentCollection;
                    userCollection = req.app.locals.userCollection;
                    commentId = req.params.id;
                    userId = (_a = req.session.currentUser) === null || _a === void 0 ? void 0 : _a._id;
                    console.log("CommentId:", commentId);
                    console.log("userId:", userId);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 11, , 12]);
                    return [4 /*yield*/, commentCollection.findOne({ _id: new mongodb_1.ObjectId(commentId), "likes.uid": new mongodb_1.ObjectId(userId) })];
                case 2:
                    post = _b.sent();
                    if (!!post) return [3 /*break*/, 6];
                    return [4 /*yield*/, commentCollection.updateOne({ _id: new mongodb_1.ObjectId(commentId) }, { $push: { likes: { uid: new mongodb_1.ObjectId(userId) } } })];
                case 3:
                    result = _b.sent();
                    // Add post id to the user's liked array
                    return [4 /*yield*/, userCollection.updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $push: { likes: commentId } })];
                case 4:
                    // Add post id to the user's liked array
                    _b.sent();
                    return [4 /*yield*/, commentCollection.findOne({ _id: new mongodb_1.ObjectId(commentId) })];
                case 5:
                    likeCount = _b.sent();
                    return [2 /*return*/, res.status(200).json({ isLiked: true, likeCount: likeCount.likes.length })];
                case 6: 
                // User has already liked the comment, remove like
                return [4 /*yield*/, commentCollection.updateOne({ _id: new mongodb_1.ObjectId(commentId) }, { $pull: { likes: { uid: new mongodb_1.ObjectId(userId) } } })];
                case 7:
                    // User has already liked the comment, remove like
                    _b.sent();
                    // Remove post id from the user's liked array
                    return [4 /*yield*/, userCollection.updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $pull: { likes: commentId } })];
                case 8:
                    // Remove post id from the user's liked array
                    _b.sent();
                    return [4 /*yield*/, commentCollection.findOne({ _id: new mongodb_1.ObjectId(commentId) })];
                case 9:
                    likeCount = _b.sent();
                    return [2 /*return*/, res.status(200).json({ isLiked: false, likesCount: likeCount.likes.length })];
                case 10: return [3 /*break*/, 12];
                case 11:
                    error_2 = _b.sent();
                    console.error(error_2);
                    return [2 /*return*/, res.status(500).json({ message: "Error liking comment", error: error_2 })];
                case 12: return [2 /*return*/];
            }
        });
    }); });
    // Fetch like status for a comment
    router.get('/likeComment/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var commentCollection, postId, userId, post, likeCount, error_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    commentCollection = req.app.locals.commentCollection;
                    postId = req.params.id;
                    userId = (_a = req.session.currentUser) === null || _a === void 0 ? void 0 : _a._id;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, commentCollection.findOne({ _id: new mongodb_1.ObjectId(postId), "likes.uid": new mongodb_1.ObjectId(userId) })];
                case 2:
                    post = _b.sent();
                    return [4 /*yield*/, commentCollection.findOne({ _id: new mongodb_1.ObjectId(postId) })];
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
                    error_3 = _b.sent();
                    console.error(error_3);
                    return [2 /*return*/, res.status(500).json({ message: "Error fetching like status", error: error_3 })];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    //fetch the comments
    router.get('/fetch/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var commentCollection, postId, comments, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    commentCollection = req.app.locals.commentCollection;
                    postId = req.params.id;
                    console.log(postId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, commentCollection.find({ postId: postId }).toArray()];
                case 2:
                    comments = _a.sent();
                    return [2 /*return*/, res.status(200).json({ comments: comments })];
                case 3:
                    error_4 = _a.sent();
                    console.error(error_4);
                    return [2 /*return*/, res.status(500).json({ message: "Error fetching comments", error: error_4 })];
                case 4: return [2 /*return*/];
            }
        });
    }); });
}
exports.default = mountCommentEndpoints;
