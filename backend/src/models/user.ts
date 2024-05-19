import mongoose, { Schema, Document, Types } from 'mongoose';
import { UserData } from '../types/user';

const userSchema: Schema = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true, auto: true },
  username: { type: String, required: true },
  uid: { type: String, required: true },
  bio: { type: String, required: true },
  coinBalance: { type: Number, required: true },
  roles: { type: [String], required: true },
  accessToken: { type: String, required: true },
  communitiesCreated: { type: [Schema.Types.ObjectId], ref: 'community' },
  communitiesJoined: { type: [Schema.Types.ObjectId], ref: 'community' },
  likes: { type: [Schema.Types.ObjectId], ref: 'posts' },
  comments: { type: [Schema.Types.ObjectId], ref: 'comments' },
  posts: { type: [Schema.Types.ObjectId], ref: 'posts' },
  timestamp: { type: Date, default: Date.now }
});

// Extend UserDocument to include UserData properties and Mongoose's Document interface
export interface UserDocument extends Document {
    _id: Types.ObjectId;
    username: string;
    uid: string;
    bio: string;
    coinBalance: number;
    roles: Array<string>;
    accessToken: string;
    communitiesCreated: Array<Types.ObjectId>;
    communitiesJoined: Array<Types.ObjectId>;
    likes: Array<Types.ObjectId>;
    comments: Array<Types.ObjectId>;
    posts: Array<Types.ObjectId>;
    timestamp: Date;
}

// Create and export the User model
const user = mongoose.model<UserDocument>('user', userSchema);

export default user;