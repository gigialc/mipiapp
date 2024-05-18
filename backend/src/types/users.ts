import { ObjectId } from "mongodb";
import { CommunityType } from "./community";

export interface UserData {
  _id: ObjectId,
  username: string,
  uid: string,
  bio: string,
  coinBalance: number,
  roles: Array<string>,
  accessToken: string,
  communitiesCreated: Array<ObjectId>,
  communitiesJoined: Array<ObjectId>,
  likes: Array<ObjectId>, 
  comments: Array<ObjectId>,
  posts: Array<ObjectId>,
  timestamp: Date // Add a field for the timestamp
}
