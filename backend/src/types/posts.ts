// Define community types
// Creator: Gigi
import { Types } from 'mongoose';

export interface PostType {
    _id: Types.ObjectId;
    title: string;
    description: string;
    user: Types.ObjectId;  // Assuming user is stored as an ObjectId
    communityId: Types.ObjectId;  // Use camelCase for consistency
    comments: Types.ObjectId[];  // Assuming comments are stored as ObjectIds
    likes: Types.ObjectId[];  // Assuming likes are stored as ObjectIds
    timestamp: Date;
}
