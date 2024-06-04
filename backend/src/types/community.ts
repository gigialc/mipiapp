// Define community types
// Creator: Gigi
import { Types } from 'mongoose';
import { UserData } from './user';

export interface CommunityType {
  _id: Types.ObjectId;  // Use Types.ObjectId from mongoose for consistency
  title: string;
  description: string;
  creator: UserData;  // Assuming UserData is correctly typed
  price: number;
  members: Array<Types.ObjectId>;
  posts: Array<Types.ObjectId>;
  comments: Array<string>;  // Assuming comments are strings
  timestamp: Date;
}
