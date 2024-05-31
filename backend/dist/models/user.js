"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
    _id: { type: mongoose_1.Schema.Types.ObjectId, required: true, auto: true },
    username: { type: String, required: true },
    uid: { type: String, required: true },
    bio: { type: String, required: true },
    coinBalance: { type: Number, required: true },
    roles: { type: [String], required: true },
    accessToken: { type: String, required: true },
    communitiesCreated: { type: [mongoose_1.Schema.Types.ObjectId], ref: 'community' },
    communitiesJoined: { type: [mongoose_1.Schema.Types.ObjectId], ref: 'community' },
    likes: { type: [mongoose_1.Schema.Types.ObjectId], ref: 'posts' },
    comments: { type: [mongoose_1.Schema.Types.ObjectId], ref: 'comments' },
    posts: { type: [mongoose_1.Schema.Types.ObjectId], ref: 'posts' },
    timestamp: { type: Date, default: Date.now }
});
// Create and export the User model
const user = mongoose_1.default.model('user', userSchema);
exports.default = user;
