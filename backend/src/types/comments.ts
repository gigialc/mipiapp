import { Types } from 'mongoose';
import { UserData } from './user';

export interface CommentType {
    _id: Types.ObjectId;
    content: string;
    user: Types.ObjectId;
    posts: Types.ObjectId;
    likes: Types.ObjectId[];
    timestamp: Date;
}

