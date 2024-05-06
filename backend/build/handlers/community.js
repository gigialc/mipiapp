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
function mountCommunityEndpoints(router) {
    var _this = this;
    router.get('/create', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var communityCollection, communities;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    communityCollection = req.app.locals.communityCollection;
                    return [4 /*yield*/, communityCollection.find().toArray()];
                case 1:
                    communities = _a.sent();
                    return [2 /*return*/, res.status(200).json({ communities: communities })];
            }
        });
    }); });
    router.post('/create', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var communityCollection, creatorId, community, userCollection, creatorData, app, communityData, insertResult, newCommunity, updateResult, updatedUser, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    communityCollection = req.app.locals.communityCollection;
                    creatorId = (_a = req.session.currentUser) === null || _a === void 0 ? void 0 : _a.uid;
                    community = req.body;
                    userCollection = req.app.locals.userCollection;
                    if (!creatorId) {
                        return [2 /*return*/, res.status(401).json({ error: 'unauthorized', message: "User needs to sign in first" })];
                    }
                    return [4 /*yield*/, userCollection.findOne({ uid: creatorId })];
                case 1:
                    creatorData = _b.sent();
                    if (!creatorData) {
                        return [2 /*return*/, res.status(404).json({ error: 'User not found', message: "The user does not exist in the database" })];
                    }
                    console.log(community);
                    app = req.app;
                    communityData = {
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
                    return [4 /*yield*/, communityCollection.insertOne(communityData)];
                case 2:
                    insertResult = _b.sent();
                    return [4 /*yield*/, communityCollection.findOne({ _id: insertResult.insertedId })];
                case 3:
                    newCommunity = _b.sent();
                    return [4 /*yield*/, userCollection.updateOne({ _id: creatorData._id }, { $push: { communitiesCreated: newCommunity._id } })];
                case 4:
                    updateResult = _b.sent();
                    return [4 /*yield*/, userCollection.findOne({ _id: creatorData._id })];
                case 5:
                    updatedUser = _b.sent();
                    req.session.currentUser = updatedUser;
                    return [2 /*return*/, res.status(200).json({ newCommunity: newCommunity })];
                case 6:
                    error_1 = _b.sent();
                    console.log(error_1);
                    return [2 /*return*/, res.status(400).json({ message: "Error creating community", error: error_1 })];
                case 7: return [2 /*return*/];
            }
        });
    }); });
    //adding an array of posts to a community
    router.post('/posts', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var communityCollection, communityId, post, updateResult, updatedCommunity, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    communityCollection = req.app.locals.communityCollection;
                    communityId = req.body.community_id;
                    post = req.body.post;
                    if (!communityId || !post) {
                        // If there's no community ID or post data, return a bad request response
                        return [2 /*return*/, res.status(400).json({ error: 'bad request', message: "Missing community ID or post data" })];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, communityCollection.updateOne({ _id: new mongodb_1.ObjectId(communityId) }, { $push: { posts: post } })];
                case 2:
                    updateResult = _a.sent();
                    if (updateResult.matchedCount === 0) {
                        // If no community matches the given ID, return a not found response
                        return [2 /*return*/, res.status(404).json({ error: 'not found', message: "Community not found" })];
                    }
                    return [4 /*yield*/, communityCollection.findOne({ _id: new mongodb_1.ObjectId(communityId) })];
                case 3:
                    updatedCommunity = _a.sent();
                    // Return the updated community
                    return [2 /*return*/, res.status(200).json({ updatedCommunity: updatedCommunity })];
                case 4:
                    error_2 = _a.sent();
                    // If an error occurs, return an error response
                    console.error(error_2);
                    return [2 /*return*/, res.status(500).json({ error: 'internal server error', message: "An error occurred while updating the community" })];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    //get the array of posts from a community
    router.get('/posts', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var communityCollection, communityId, community, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!req.session.currentUser) {
                        return [2 /*return*/, res.status(401).json({ error: 'unauthorized', message: "User needs to sign in first" })];
                    }
                    communityCollection = req.app.locals.communityCollection;
                    communityId = req.query.community_id;
                    if (!communityId) {
                        // If there's no community ID, return a bad request response
                        return [2 /*return*/, res.status(400).json({ error: 'bad request', message: "Missing community ID" })];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, communityCollection.findOne({ _id: new String(communityId) })];
                case 2:
                    community = _a.sent();
                    if (!community) {
                        // If no community matches the given ID, return a not found response
                        return [2 /*return*/, res.status(404).json({ error: 'not found', message: "Community not found" })];
                    }
                    // Return the community's posts
                    return [2 /*return*/, res.status(200).json({ posts: community.posts })];
                case 3:
                    error_3 = _a.sent();
                    // If an error occurs, return an error response
                    console.error(error_3);
                    return [2 /*return*/, res.status(500).json({ error: 'internal server error', message: "An error occurred while retrieving the community's posts" })];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    router.get('/hi', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var communityCollection, creatorId_1, userCollection, communities, filteredCommunities, error_4;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    if (!req.session.currentUser) {
                        return [2 /*return*/, res.status(401).json({ error: 'unauthorized', message: "User needs to sign in first" })];
                    }
                    communityCollection = req.app.locals.communityCollection;
                    creatorId_1 = (_a = req.session.currentUser) === null || _a === void 0 ? void 0 : _a.uid;
                    userCollection = req.app.locals.userCollection;
                    return [4 /*yield*/, communityCollection.find({}).toArray()];
                case 1:
                    communities = _b.sent();
                    filteredCommunities = communities.filter(function (community) {
                        return community.user.uid !== creatorId_1;
                    });
                    // Send the array of filtered communities back to the client
                    return [2 /*return*/, res.status(200).json(filteredCommunities)];
                case 2:
                    error_4 = _b.sent();
                    console.log(error_4);
                    return [2 /*return*/, res.status(500).json({ message: "Error fetching communities", error: error_4 })];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    router.get('/username', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var communityCollection, community, userId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    communityCollection = req.app.locals.communityCollection;
                    return [4 /*yield*/, communityCollection.find().toArray()];
                case 1:
                    community = _a.sent();
                    userId = community.user.username;
                    return [2 /*return*/, res.status(200).json({ community: community, userId: userId })];
            }
        });
    }); });
    router.get('/community/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var communityCollection, id, community, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    communityCollection = req.app.locals.communityCollection;
                    id = req.params.id;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) })];
                case 2:
                    community = _a.sent();
                    if (!community) {
                        return [2 /*return*/, res.status(404).json({ error: 'Community not found' })];
                    }
                    console.log(community);
                    return [2 /*return*/, res.status(200).json({ name: community.name, description: community.description, price: community.price, user: community.user, moderators: community.moderators, members: community.members, invited: community.invited, posts: community.posts, rules: community.rules, tags: community.tags, createdAt: community.createdAt, updatedAt: community.updatedAt })];
                case 3:
                    error_5 = _a.sent();
                    console.error(error_5);
                    return [2 /*return*/, res.status(500).json({ message: "Error fetching community", error: error_5 })];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    router.put('/community/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var communityCollection, id, community, updateResult, updatedCommunity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    communityCollection = req.app.locals.communityCollection;
                    id = req.params.id;
                    community = req.body.community;
                    return [4 /*yield*/, communityCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: community })];
                case 1:
                    updateResult = _a.sent();
                    return [4 /*yield*/, communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) })];
                case 2:
                    updatedCommunity = _a.sent();
                    return [2 /*return*/, res.status(200).json({ updatedCommunity: updatedCommunity })];
            }
        });
    }); });
    router.delete('/community/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var communityCollection, id, deleteResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    communityCollection = req.app.locals.communityCollection;
                    id = req.params.id;
                    return [4 /*yield*/, communityCollection.deleteOne({ _id: new mongodb_1.ObjectId(id) })];
                case 1:
                    deleteResult = _a.sent();
                    return [2 /*return*/, res.status(200).json({ deleteResult: deleteResult })];
            }
        });
    }); });
    //adding user to a community
    router.post('/community/:id/addUser', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var communityCollection, id, user, community;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    communityCollection = req.app.locals.communityCollection;
                    id = req.body.community_id;
                    user = req.body.user_id;
                    return [4 /*yield*/, communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) })];
                case 1:
                    community = _a.sent();
                    if (community.members.includes(user)) {
                        return [2 /*return*/, res.status(200).json({ message: "User is already a member" })];
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    router.post('/community/:id/leave', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var communityCollection, id, user, community, updateResult, updatedCommunity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    communityCollection = req.app.locals.communityCollection;
                    id = req.params.id;
                    user = req.body.user;
                    return [4 /*yield*/, communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) })];
                case 1:
                    community = _a.sent();
                    if (!community.members.includes(user.uid)) {
                        return [2 /*return*/, res.status(200).json({ message: "User is not a member" })];
                    }
                    return [4 /*yield*/, communityCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $pull: { members: user.uid } })];
                case 2:
                    updateResult = _a.sent();
                    return [4 /*yield*/, communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) })];
                case 3:
                    updatedCommunity = _a.sent();
                    return [2 /*return*/, res.status(200).json({ updatedCommunity: updatedCommunity })];
            }
        });
    }); });
    router.post('/community/:id/post', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var communityCollection, id, post, updateResult, updatedCommunity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    communityCollection = req.app.locals.communityCollection;
                    id = req.params.id;
                    post = req.body.post;
                    return [4 /*yield*/, communityCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $push: { posts: post } })];
                case 1:
                    updateResult = _a.sent();
                    return [4 /*yield*/, communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) })];
                case 2:
                    updatedCommunity = _a.sent();
                    return [2 /*return*/, res.status(200).json({ updatedCommunity: updatedCommunity })];
            }
        });
    }); });
    router.post('/community/:id/admin', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var communityCollection, id, user, community, updateResult, updatedCommunity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    communityCollection = req.app.locals.communityCollection;
                    id = req.params.id;
                    user = req.body.user;
                    return [4 /*yield*/, communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) })];
                case 1:
                    community = _a.sent();
                    if (community.admins.includes(user.uid)) {
                        return [2 /*return*/, res.status(200).json({ message: "User is already an admin" })];
                    }
                    return [4 /*yield*/, communityCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $push: { admins: user.uid } })];
                case 2:
                    updateResult = _a.sent();
                    return [4 /*yield*/, communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) })];
                case 3:
                    updatedCommunity = _a.sent();
                    return [2 /*return*/, res.status(200).json({ updatedCommunity: updatedCommunity })];
            }
        });
    }); });
    router.post('/community/:id/unadmin', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var communityCollection, id, user, community, updateResult, updatedCommunity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    communityCollection = req.app.locals.communityCollection;
                    id = req.params.id;
                    user = req.body.user;
                    return [4 /*yield*/, communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) })];
                case 1:
                    community = _a.sent();
                    if (!community.admins.includes(user.uid)) {
                        return [2 /*return*/, res.status(200).json({ message: "User is not an admin" })];
                    }
                    return [4 /*yield*/, communityCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $pull: { admins: user.uid } })];
                case 2:
                    updateResult = _a.sent();
                    return [4 /*yield*/, communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) })];
                case 3:
                    updatedCommunity = _a.sent();
                    return [2 /*return*/, res.status(200).json({ updatedCommunity: updatedCommunity })];
            }
        });
    }); });
    router.post('/community/:id/invite', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var communityCollection, id, user, community, updateResult, updatedCommunity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    communityCollection = req.app.locals.communityCollection;
                    id = req.params.id;
                    user = req.body.user;
                    return [4 /*yield*/, communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) })];
                case 1:
                    community = _a.sent();
                    if (community.invited.includes(user.uid)) {
                        return [2 /*return*/, res.status(200).json({ message: "User is already invited" })];
                    }
                    return [4 /*yield*/, communityCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $push: { invited: user.uid } })];
                case 2:
                    updateResult = _a.sent();
                    return [4 /*yield*/, communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) })];
                case 3:
                    updatedCommunity = _a.sent();
                    return [2 /*return*/, res.status(200).json({ updatedCommunity: updatedCommunity })];
            }
        });
    }); });
    router.post('/community/:id/uninvite', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var communityCollection, id, user, community, updateResult, updatedCommunity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    communityCollection = req.app.locals.communityCollection;
                    id = req.params.id;
                    user = req.body.user;
                    return [4 /*yield*/, communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) })];
                case 1:
                    community = _a.sent();
                    if (!community.invited.includes(user.uid)) {
                        return [2 /*return*/, res.status(200).json({ message: "User is not invited" })];
                    }
                    return [4 /*yield*/, communityCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $pull: { invited: user.uid } })];
                case 2:
                    updateResult = _a.sent();
                    return [4 /*yield*/, communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) })];
                case 3:
                    updatedCommunity = _a.sent();
                    return [2 /*return*/, res.status(200).json({ updatedCommunity: updatedCommunity })];
            }
        });
    }); });
    router.post('/community/:id/accept', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var communityCollection, id, user, community, updateResult, updatedCommunity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    communityCollection = req.app.locals.communityCollection;
                    id = req.params.id;
                    user = req.body.user;
                    return [4 /*yield*/, communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) })];
                case 1:
                    community = _a.sent();
                    if (!community.invited.includes(user.uid)) {
                        return [2 /*return*/, res.status(200).json({ message: "User is not invited" })];
                    }
                    return [4 /*yield*/, communityCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $pull: { invited: user.uid } })];
                case 2:
                    updateResult = _a.sent();
                    return [4 /*yield*/, communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) })];
                case 3:
                    updatedCommunity = _a.sent();
                    return [2 /*return*/, res.status(200).json({ updatedCommunity: updatedCommunity })];
            }
        });
    }); });
    router.post('/community/:id/decline', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var communityCollection, id, user, community, updateResult, updatedCommunity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    communityCollection = req.app.locals.communityCollection;
                    id = req.params.id;
                    user = req.body.user;
                    return [4 /*yield*/, communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) })];
                case 1:
                    community = _a.sent();
                    if (!community.invited.includes(user.uid)) {
                        return [2 /*return*/, res.status(200).json({ message: "User is not invited" })];
                    }
                    return [4 /*yield*/, communityCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $pull: { invited: user.uid } })];
                case 2:
                    updateResult = _a.sent();
                    return [4 /*yield*/, communityCollection.findOne({ _id: new mongodb_1.ObjectId(id) })];
                case 3:
                    updatedCommunity = _a.sent();
                    return [2 /*return*/, res.status(200).json({ updatedCommunity: updatedCommunity })];
            }
        });
    }); });
    //onclick 
    //onchange
    //onchan    
    //onsubmit
}
exports.default = mountCommunityEndpoints;
