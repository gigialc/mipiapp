import mongoose, { Schema, Document, Types } from 'mongoose';
import { PostType } from '../types/posts';

const postSchema: Schema = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true, auto: true }, // auto: true added for auto-generation
  title: { type: String, required: true },
  content: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  communityId: { type: Schema.Types.ObjectId, ref: 'community', required: true },
  comments: { type: [Schema.Types.ObjectId], ref: 'comments' },
  likes: { type: [Schema.Types.ObjectId], ref: 'user' },
  timestamp: { type: Date, default: Date.now }
});

// Extend PostDocument to include PostData properties and Mongoose's Document interface
export interface PostDocument extends PostType, Document {
    _id: Types.ObjectId;
    title: string;
    content: string;
    user: Types.ObjectId;
    communityId: Types.ObjectId;
    comments: Types.ObjectId[];
    likes: Types.ObjectId[];
    timestamp: Date;

}

// Create and export the Post model
const posts = mongoose.model<PostDocument>("posts", postSchema);

export default posts;
