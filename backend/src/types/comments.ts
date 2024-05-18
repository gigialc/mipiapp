import { ObjectId } from "mongodb";
import { UserData } from "./users";

export interface CommentType {
    _id: ObjectId;
    content: string;
    user: UserData;
    posts: ObjectId;
    likes: Array<ObjectId>;
    timestamp: Date;

}

