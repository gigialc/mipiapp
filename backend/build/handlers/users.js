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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var platformAPIClient_1 = __importDefault(require("../services/platformAPIClient"));
var mongodb_1 = require("mongodb");
function mountUserEndpoints(router) {
    var _this = this;
    // handle the user auth accordingly
    router.post('/signin', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var auth, userCollection, me, err_1, currentUser, insertResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    auth = req.body.authResult;
                    userCollection = req.app.locals.userCollection;
                    console.log(auth);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, platformAPIClient_1.default.get("/v2/me", { headers: { 'Authorization': "Bearer ".concat(auth.accessToken) } })];
                case 2:
                    me = _a.sent();
                    console.log(me);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.log(err_1);
                    return [2 /*return*/, res.status(401).json({ error: "Invalid access token" })];
                case 4: return [4 /*yield*/, userCollection.findOne({ uid: auth.user.uid })];
                case 5:
                    currentUser = _a.sent();
                    console.log(currentUser);
                    if (!currentUser) return [3 /*break*/, 7];
                    return [4 /*yield*/, userCollection.updateOne({
                            _id: currentUser._id
                        }, {
                            $set: {
                                accessToken: auth.accessToken,
                            }
                        })];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 7: return [4 /*yield*/, userCollection.insertOne({
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
                    })];
                case 8:
                    insertResult = _a.sent();
                    return [4 /*yield*/, userCollection.findOne(insertResult.insertedId)];
                case 9:
                    currentUser = _a.sent();
                    _a.label = 10;
                case 10:
                    req.session.currentUser = currentUser;
                    return [2 /*return*/, res.status(200).json({ message: "User signed in" })];
            }
        });
    }); });
    console.log("hi6");
    // handle the user auth accordingly
    router.get('/signout', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            req.session.currentUser = null;
            return [2 /*return*/, res.status(200).json({ message: "User signed out" })];
        });
    }); });
    //Get info about user 
    router.get('/userInfo', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var currentUser;
        return __generator(this, function (_a) {
            currentUser = req.session.currentUser;
            if (!currentUser) {
                return [2 /*return*/, res.status(401).json({ error: "No current user found" })];
            }
            return [2 /*return*/, res.status(200).json(currentUser)];
        });
    }); });
    //Update user info
    router.post('/update', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var currentUser, userCollection, _a, username, bio, coinbalance, updatedUser;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    currentUser = req.session.currentUser;
                    if (!currentUser) {
                        return [2 /*return*/, res.status(401).json({ error: "No current user found" })];
                    }
                    userCollection = req.app.locals.userCollection;
                    _a = req.body, username = _a.username, bio = _a.bio, coinbalance = _a.coinbalance;
                    return [4 /*yield*/, userCollection.findOneAndUpdate({ uid: currentUser.uid }, { $set: { username: username, bio: bio, coinBalance: coinbalance } }, { new: true, returnDocument: 'after' })];
                case 1:
                    updatedUser = _b.sent();
                    if (!updatedUser) {
                        return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                    }
                    return [2 /*return*/, res.status(200).json({ message: "User updated successfully" })];
            }
        });
    }); });
    // Get all the communitiesCreated the user has created
    router.get('/me', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var currentUser, communityCollection_1, communities, communityMap, err_2;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    currentUser = req.session.currentUser;
                    if (!currentUser) {
                        return [2 /*return*/, res.status(401).json({ error: "No current user found" })];
                    }
                    communityCollection_1 = req.app.locals.communityCollection;
                    return [4 /*yield*/, Promise.all(currentUser.communitiesCreated.map(function (communityId) { return __awaiter(_this, void 0, void 0, function () {
                            var community;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, communityCollection_1.findOne({ _id: new mongodb_1.ObjectId(communityId) })];
                                    case 1:
                                        community = _a.sent();
                                        return [2 /*return*/, community]; // May return null if not found
                                }
                            });
                        }); }))];
                case 1:
                    communities = _a.sent();
                    communityMap = communities.filter(function (c) { return c; }).map(function (community) { return ({
                        _id: community._id.toString(),
                        name: community.name,
                        description: community.description,
                        posts: community.posts,
                        // Add other fields as needed
                    }); });
                    if (communityMap.length > 0) {
                        return [2 /*return*/, res.status(200).json(communityMap)];
                    }
                    else {
                        return [2 /*return*/, res.status(404).json({ error: "User did not create any communities" })];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    console.error(err_2);
                    return [2 /*return*/, res.status(500).json({ error: "Internal server error" })];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Get all the communitiesJoined the user has joined
    router.get('/joined', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var currentUser, communityCollection_2, communities, communityMap, err_3;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    currentUser = req.session.currentUser;
                    if (!currentUser) {
                        return [2 /*return*/, res.status(401).json({ error: "No current user found" })];
                    }
                    communityCollection_2 = req.app.locals.communityCollection;
                    return [4 /*yield*/, Promise.all(currentUser.communitiesJoined.map(function (communityId) { return __awaiter(_this, void 0, void 0, function () {
                            var community;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, communityCollection_2.findOne({ _id: new mongodb_1.ObjectId(communityId) })];
                                    case 1:
                                        community = _a.sent();
                                        return [2 /*return*/, community]; // May return null if not found
                                }
                            });
                        }); }))];
                case 1:
                    communities = _a.sent();
                    communityMap = communities.filter(function (c) { return c; }).map(function (community) { return ({
                        _id: community._id.toString(),
                        name: community.name,
                        description: community.description,
                        posts: community.posts,
                        // Add other fields as needed
                    }); });
                    if (communityMap.length > 0) {
                        return [2 /*return*/, res.status(200).json(communityMap)];
                    }
                    else {
                        return [2 /*return*/, res.status(404).json({ error: "User has not joined any communities" })];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_3 = _a.sent();
                    console.error(err_3);
                    return [2 /*return*/, res.status(500).json({ error: "Internal server error" })];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Update the user collection by adding a community object to the joined communities
    router.post('/addUser', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, userId, communityId, userCollection, updatedUser, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    _a = req.body, userId = _a.userId, communityId = _a.communityId;
                    userCollection = req.app.locals.userCollection;
                    return [4 /*yield*/, userCollection.findOneAndUpdate({ uid: userId }, { $addToSet: { communitiesJoined: communityId } }, // Use communityId directly if it's stored as a string
                        { new: true, returnDocument: 'after' })];
                case 1:
                    updatedUser = _b.sent();
                    if (!updatedUser) {
                        return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                    }
                    return [2 /*return*/, res.status(200).json({ message: "Community added to joined communities successfully" })];
                case 2:
                    error_1 = _b.sent();
                    console.error(error_1);
                    return [2 /*return*/, res.status(500).json({ error: "Internal server error" })];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    //get username for the user id from community
    router.get('/username', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userCollection, user, userObject;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userCollection = req.app.locals.userCollection;
                    user = req.query.user_id;
                    console.log(user);
                    return [4 /*yield*/, userCollection.findOne({ uid: user })];
                case 1:
                    userObject = _a.sent();
                    console.log(userObject);
                    return [2 /*return*/, res.status(200).json({ username: userObject.username })];
            }
        });
    }); });
    //check if user has liked a particular postid
    router.get('/liked', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userCollection, user, post, userObject, liked;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userCollection = req.app.locals.userCollection;
                    user = req.query.user_id;
                    post = req.query.post_id;
                    return [4 /*yield*/, userCollection.findOne({ uid: user })];
                case 1:
                    userObject = _a.sent();
                    liked = userObject.likes.includes(post);
                    return [2 /*return*/, res.status(200).json({ liked: liked })];
            }
        });
    }); });
}
exports.default = mountUserEndpoints;
