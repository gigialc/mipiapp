import mongoose, { Schema, Document, Types } from 'mongoose';

const commentsSchema: Schema = new Schema({
    _id: { type: Schema.Types.ObjectId, required: true },
    content: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    posts: { type: Schema.Types.ObjectId, ref: 'posts' },
    likes: { type: [Schema.Types.ObjectId], ref: 'user' },
    timestamp: { type: Date, default: Date.now }

});

export interface CommentDocument extends Document {
    _id: Types.ObjectId;
    content: string;
    user: Types.ObjectId;
    posts: Types.ObjectId;
    likes: Types.ObjectId[];
    timestamp: Date;
}

// Create and export the Comment model
const comments = mongoose.model<CommentDocument>('comments', commentsSchema);

export default comments;