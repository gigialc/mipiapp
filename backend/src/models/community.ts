import mongoose, { Schema, Document, Types } from 'mongoose';
import { UserData } from '../types/user';
import { UserDocument } from './user';

const communitySchema: Schema = new Schema({
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    creator: { type: String, required: true }, // Store creator as a string (UUID)
    price: { type: Number, required: true },
    members: { type: [Schema.Types.ObjectId], ref: 'user' },
    posts: { type: [Schema.Types.ObjectId], ref: 'posts' },
    comments: { type: [String], required: true },
    timestamp: { type: Date, default: Date.now }
},{ collection: 'community' }); // Explicitly specify the collection name

export interface CommunityDocument extends Document {
    _id: Types.ObjectId;
    title: string;
    description: string;
    creator: string; 
    price: number;
    members: Array<Types.ObjectId>;
    posts: Array<Types.ObjectId>;
    comments: Array<string>;  // Assuming comments are strings
    timestamp: Date;
}

// Create and export the Community model
const Community = mongoose.model<CommunityDocument>('Community', communitySchema);

export default Community;
