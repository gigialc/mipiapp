// Define community types
// Creator: Gigi
import { ObjectId } from "mongodb";
import { UserData } from "./user";

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

