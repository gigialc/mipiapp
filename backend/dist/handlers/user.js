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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const platformAPIClient_1 = __importDefault(require("../services/platformAPIClient"));
function mountUserEndpoints(router) {
    router.post('/signin', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const auth = req.body.authResult;
        const userCollection = req.app.locals.userCollection;
        try {
            const me = yield platformAPIClient_1.default.get(`/v2/me`, { headers: { 'Authorization': `Bearer ${auth.accessToken}` } });
            console.log(me);
        }
        catch (err) {
            console.log(err);
            return res.status(401).json({ error: "Invalid access token" });
        }
        let currentUser = yield userCollection.findOne({ uid: auth.user.uid });
        if (currentUser) {
            yield userCollection.updateOne({ _id: currentUser._id }, { $set: { accessToken: auth.accessToken } });
        }
        else {
            const insertResult = yield userCollection.insertOne({
                username: auth.user.username,
                uid: auth.user.uid,
                roles: auth.user.roles,
                accessToken: auth.accessToken,
                communitiesCreated: [],
                communitiesJoined: [],
                likes: [],
                comments: [],
                posts: [],
                bio: "",
                coinBalance: 0,
                timestamp: new Date()
            });
            currentUser = yield userCollection.findOne({ _id: insertResult.insertedId });
        }
        req.session.currentUser = currentUser;
        return res.status(200).json({ message: "User signed in", user: currentUser });
    }));
    router.get('/signout', (req, res) => __awaiter(this, void 0, void 0, function* () {
        req.session.currentUser = null;
        return res.status(200).json({ message: "User signed out" });
    }));
    router.get('/userInfo', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const currentUser = req.session.currentUser;
        if (!currentUser) {
            return res.status(401).json({ error: "No current user found" });
        }
        return res.status(200).json(currentUser);
    }));
    router.post('/update', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const currentUser = req.session.currentUser;
        if (!currentUser) {
            return res.status(401).json({ error: "No current user found" });
        }
        const userCollection = req.app.locals.userCollection;
        const { username, bio, coinBalance } = req.body;
        const updatedUser = yield userCollection.findOneAndUpdate({ uid: currentUser.uid }, { $set: { username, bio, coinBalance } }, { new: true, returnDocument: 'after' });
        if (!updatedUser.value) {
            return res.status(404).json({ error: "User not found" });
        }
        req.session.currentUser = updatedUser.value;
        return res.status(200).json({ message: "User updated successfully", user: updatedUser.value });
    }));
    router.get('/me', (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const currentUser = req.session.currentUser;
            if (!currentUser) {
                return res.status(401).json({ error: "No current user found" });
            }
            const communityCollection = req.app.locals.communityCollection;
            const communities = yield communityCollection.find({
                _id: { $in: currentUser.communitiesCreated.map(id => new mongoose_1.Types.ObjectId(id)) }
            }).toArray();
            const communityMap = communities.map((community) => ({
                _id: community._id.toString(),
                name: community.name,
                description: community.description,
                posts: community.posts,
            }));
            return res.status(200).json(communityMap);
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }));
    router.get('/joined', (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const currentUser = req.session.currentUser;
            if (!currentUser) {
                return res.status(401).json({ error: "No current user found" });
            }
            const communityCollection = req.app.locals.communityCollection;
            const communities = yield communityCollection.find({
                _id: { $in: currentUser.communitiesJoined.map(id => new mongoose_1.Types.ObjectId(id)) }
            }).toArray();
            const communityMap = communities.map((community) => ({
                _id: community._id.toString(),
                name: community.name,
                description: community.description,
                posts: community.posts,
            }));
            if (communityMap.length > 0) {
                return res.status(200).json(communityMap);
            }
            else {
                return res.status(404).json({ error: "User has not joined any communities" });
            }
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }));
    router.post('/addUser', (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, communityId } = req.body;
            const userCollection = req.app.locals.userCollection;
            const updatedUser = yield userCollection.findOneAndUpdate({ uid: userId }, { $addToSet: { communitiesJoined: new mongoose_1.Types.ObjectId(communityId) } }, { new: true, returnDocument: 'after' });
            if (!updatedUser.value) {
                return res.status(404).json({ error: "User not found" });
            }
            return res.status(200).json({ message: "Community added to joined communities successfully" });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }));
    router.get('/username', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const userCollection = req.app.locals.userCollection;
        const userId = req.query.user_id;
        try {
            const userObject = yield userCollection.findOne({ uid: userId });
            if (!userObject) {
                return res.status(404).json({ error: "User not found" });
            }
            return res.status(200).json({ username: userObject.username });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }));
    router.get('/liked', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const userCollection = req.app.locals.userCollection;
        const userId = req.query.user_id;
        const postId = req.query.post_id;
        try {
            const userObject = yield userCollection.findOne({ uid: userId });
            if (!userObject) {
                return res.status(404).json({ error: "User not found" });
            }
            const liked = userObject.likes.includes(new mongoose_1.Types.ObjectId(postId));
            return res.status(200).json({ liked });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }));
}
exports.default = mountUserEndpoints;
