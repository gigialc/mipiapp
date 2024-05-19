import { Types } from 'mongoose';

export interface UserData {
  _id: Types.ObjectId; // Align the _id type with Mongoose's ObjectId type
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

// Define other interfaces as needed
