"use strict";
// Date: 2021-08-31
// Description: This file contains the endpoints for the community collection.
// Creator: Gigi
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
function mountCommunityEndpoints(router) {
    router.get('/create', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const communityCollection = req.app.locals.communityCollection;
        const communities = yield communityCollection.find().toArray(); //include only info you need, you don't need to see the community id
        return res.status(200).json({ communities });
    }));
    router.post('/create', (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const communityCollection = req.app.locals.communityCollection;
            const creatorId = (_a = req.session.currentUser) === null || _a === void 0 ? void 0 : _a.uid; // Add a check for null or undefined
            const community = req.body;
            const userCollection = req.app.locals.userCollection;
            if (!creatorId) {
                return res.status(401).json({ error: 'unauthorized', message: "User needs to sign in first" });
            }
            const creatorData = yield userCollection.findOne({ uid: creatorId });
            if (!creatorData) {
                return res.status(404).json({ error: 'User not found', message: "The user does not exist in the database" });
            }
            console.log(community);
            const app = req.app;
            const communityData = {
                _id: new mongodb_1.ObjectId(),
                name: community.title,
                description: community.description,
                user: creatorData,
                price: community.price,
                moderators: community.moderators,
                members: community.members,
                invited: community.invited,
                posts: community.posts,
                rules: community.rules,
                tags: community.tags,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const insertResult = yield communityCollection.insertOne(communityData);
            const newCommunity = yield communityCollection.findOne({ _id: insertResult.insertedId });
            // Update the user's document to include this new community's ID in their list of created communities
            const updateResult = yield userCollection.updateOne({ _id: creatorData._id }, { $push: { communitiesCreated: newCommunity._id } });
            // Optionally, update the session's currentUser with the latest user data
            const updatedUser = yield userCollection.findOne({ _id: creatorData._id });
            req.session.currentUser = updatedUser;
            return res.status(200).json({ newCommunity });
        }
        catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Error creating community", error });
        }
    }));
    //adding an array of posts to a community
    router.post('/posts', (req, res) => __awaiter(this, void 0, void 0, function* () {
        // Assuming req.body is structured correctly with a community_id and the post data
        const communityCollection = req.app.locals.communityCollection;
        const communityId = req.body.community_id; // The ID of the community
        const post = req.body.post; // The post data
        if (!communityId || !post) {
            // If there's no community ID or post data, return a bad request response
            return res.status(400).json({ error: 'bad request', message: "Missing community ID or post data" });
        }
        try {
            // Update the community document by adding the new post to the 'posts' array
            const updateResult = yield communityCollection.updateOne({ _id: new mongodb_1.ObjectId(communityId) }, { $push: { posts: post } });
            if (updateResult.matchedCount === 0) {
                // If no community matches the given ID, return a not found response
                return res.status(404).json({ error: 'not found', message: "Community not found" });
            }
            // Retrieve the updated community document
            const updatedCommunity = yield communityCollection.findOne({ _id: new mongodb_1.ObjectId(communityId) });
            // Return the updated community
            return res.status(200).json({ updatedCommunity });
        }
        catch (error) {
            // If an error occurs, return an error response
            console.error(error);
            return res.status(500).json({ error: 'internal server error', message: "An error occurred while updating the community" });
        }
    }));
    //get the array of posts from a community
    router.get('/posts', (req, res) => __awaiter(this, void 0, void 0, function* () {
        if (!req.session.currentUser) {
            return res.status(401).json({ error: 'unauthorized', message: "User needs to sign in first" });
        }
        // Assuming req.query is structured correctly with a community_id
        const communityCollection = req.app.locals.communityCollection;
        const communityId = req.query.community_id; // The ID of the community
        if (!communityId) {
            // If there's no community ID, return a bad request response
            return res.status(400).json({ error: 'bad request', message: "Missing community ID" });
        }
        try {
            // Retrieve the community document
            const community = yield communityCollection.findOne({ _id: new String(communityId) });
            if (!community) {
                // If no community matches the given ID, return a not found response
                return res.status(404).json({ error: 'not found', message: "Community not found" });
            }
            // Return the community's posts
            return res.status(200).json({ posts: community.posts });
        }
        catch (error) {
            // If an error occurs, return an error response
            console.error(error);
            return res.status(500).json({ error: 'internal server error', message: "An error occurred while retrieving the community's posts" });
        }
    }));
    router.get('/hi', (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _b;
        try {
            if (!req.session.currentUser) {
                return res.status(401).json({ error: 'unauthorized', message: "User needs to sign in first" });
            }
            const communityCollection = req.app.locals.communityCollection;
            const creatorId = (_b = req.session.currentUser) === null || _b === void 0 ? void 0 : _b.uid;
            const userCollection = req.app.locals.userCollection;
            // Find all community documents in the collection
            const communities = yield communityCollection.find({}).toArray();
            const filteredCommunities = communities.filter((community) => {
                return community.user.uid !== creatorId;
            });
            // Send the array of filtered communities back to the client
            return res.status(200).json(filteredCommunities);
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Error fetching communities", error });
        }
    }));
    router.get('/username', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const communityCollection = req.app.locals.communityCollection;
        const community = yield communityCollection.find().toArray();
        const userId = community.user.username;
        return res.status(200).json({ community, userId });
    }));
    router.get('/community/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const communityCollection = req.app.locals.communityCollection;
        const id = req.params.id;
        try {
            const community = yield communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
            if (!community) {
                return res.status(404).json({ error: 'Community not found' });
            }
            console.log(community);
            return res.status(200).json({ name: community.name, description: community.description, price: community.price, user: community.user, moderators: community.moderators, members: community.members, invited: community.invited, posts: community.posts, rules: community.rules, tags: community.tags, createdAt: community.createdAt, updatedAt: community.updatedAt });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching community", error });
        }
    }));
    router.put('/community/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const communityCollection = req.app.locals.communityCollection;
        const id = req.params.id;
        const community = req.body.community;
        const updateResult = yield communityCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: community });
        const updatedCommunity = yield communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        return res.status(200).json({ updatedCommunity });
    }));
    router.delete('/community/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const communityCollection = req.app.locals.communityCollection;
        const id = req.params.id;
        const deleteResult = yield communityCollection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        return res.status(200).json({ deleteResult });
    }));
    //adding user to a community
    router.post('/community/:id/addUser', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const communityCollection = req.app.locals.communityCollection;
        const id = req.body.community_id;
        const user = req.body.user_id;
        const community = yield communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (community.members.includes(user)) {
            return res.status(200).json({ message: "User is already a member" });
        }
    }));
    router.post('/community/:id/leave', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const communityCollection = req.app.locals.communityCollection;
        const id = req.params.id;
        const user = req.body.user;
        const community = yield communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!community.members.includes(user.uid)) {
            return res.status(200).json({ message: "User is not a member" });
        }
        const updateResult = yield communityCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $pull: { members: user.uid } });
        const updatedCommunity = yield communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        return res.status(200).json({ updatedCommunity });
    }));
    router.post('/community/:id/post', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const communityCollection = req.app.locals.communityCollection;
        const id = req.params.id;
        const post = req.body.post;
        const updateResult = yield communityCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $push: { posts: post } });
        const updatedCommunity = yield communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        return res.status(200).json({ updatedCommunity });
    }));
    router.post('/community/:id/admin', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const communityCollection = req.app.locals.communityCollection;
        const id = req.params.id;
        const user = req.body.user;
        const community = yield communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (community.admins.includes(user.uid)) {
            return res.status(200).json({ message: "User is already an admin" });
        }
        const updateResult = yield communityCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $push: { admins: user.uid } });
        const updatedCommunity = yield communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        return res.status(200).json({ updatedCommunity });
    }));
    router.post('/community/:id/unadmin', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const communityCollection = req.app.locals.communityCollection;
        const id = req.params.id;
        const user = req.body.user;
        const community = yield communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!community.admins.includes(user.uid)) {
            return res.status(200).json({ message: "User is not an admin" });
        }
        const updateResult = yield communityCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $pull: { admins: user.uid } });
        const updatedCommunity = yield communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        return res.status(200).json({ updatedCommunity });
    }));
    router.post('/community/:id/invite', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const communityCollection = req.app.locals.communityCollection;
        const id = req.params.id;
        const user = req.body.user;
        const community = yield communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (community.invited.includes(user.uid)) {
            return res.status(200).json({ message: "User is already invited" });
        }
        const updateResult = yield communityCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $push: { invited: user.uid } });
        const updatedCommunity = yield communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        return res.status(200).json({ updatedCommunity });
    }));
    router.post('/community/:id/uninvite', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const communityCollection = req.app.locals.communityCollection;
        const id = req.params.id;
        const user = req.body.user;
        const community = yield communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!community.invited.includes(user.uid)) {
            return res.status(200).json({ message: "User is not invited" });
        }
        const updateResult = yield communityCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $pull: { invited: user.uid } });
        const updatedCommunity = yield communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        return res.status(200).json({ updatedCommunity });
    }));
    router.post('/community/:id/accept', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const communityCollection = req.app.locals.communityCollection;
        const id = req.params.id;
        const user = req.body.user;
        const community = yield communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!community.invited.includes(user.uid)) {
            return res.status(200).json({ message: "User is not invited" });
        }
        const updateResult = yield communityCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $pull: { invited: user.uid } });
        const updatedCommunity = yield communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        return res.status(200).json({ updatedCommunity });
    }));
    router.post('/community/:id/decline', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const communityCollection = req.app.locals.communityCollection;
        const id = req.params.id;
        const user = req.body.user;
        const community = yield communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!community.invited.includes(user.uid)) {
            return res.status(200).json({ message: "User is not invited" });
        }
        const updateResult = yield communityCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $pull: { invited: user.uid } });
        const updatedCommunity = yield communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        return res.status(200).json({ updatedCommunity });
    }));
    //onclick 
    //onchange
    //onchan    
    //onsubmit
}
exports.default = mountCommunityEndpoints;
