// Define community types
// Creator: Gigi
import { ObjectId } from "mongodb";
import { UserData } from "./users";

export interface CommunityType {
    _id: ObjectId,
    name: string,
    description: string,
    user: UserData,
    price: number,
    members: Array<ObjectId>,
    posts: Array<ObjectId>,
    comments : Array<String>,
    timestamp: Date
}

