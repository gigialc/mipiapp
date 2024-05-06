import { ObjectId } from "mongodb";
import { UserData } from "./user";

export interface CommentType {
    _id: ObjectId;
    content: string;
    user: UserData;
    posts: ObjectId;
    likes: Array<ObjectId>;
    date: Date;
}

