import mongoose, { Schema, Document, Types } from 'mongoose';
import { UserData } from '../types/user';


const communitySchema: Schema = new Schema({
    _id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'user' },
    members: { type: [Schema.Types.ObjectId], ref: 'user' },
    posts: { type: [Schema.Types.ObjectId], ref: 'posts' },
    timestamp: { type: Date, default: Date.now }
    });

export interface CommunityDocument extends Document {
    _id: Types.ObjectId;  // Use Types.ObjectId from mongoose for consistency
    name: string;
    description: string;
    user: UserData;  // Assuming UserData is correctly typed
    price: number;
    members: Array<Types.ObjectId>;
    posts: Array<Types.ObjectId>;
    comments: Array<string>;  // Assuming comments are strings
    timestamp: Date;
}

// Create and export the Community model
const community = mongoose.model<CommunityDocument>('community', communitySchema);

export default community;
