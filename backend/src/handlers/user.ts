import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import Community, { CommunityDocument } from '../models/community';
import platformAPIClient from "../services/platformAPIClient";
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, authenticateToken } from '../Middleware/auth';
import { Collection } from 'mongodb';
import { UserData } from '../types/user';

const router = Router();
const JWT_SECRET =  process.env.JWT_SECRET || 'UaIh0qWFOiKOnFZmyuuZ524Jp74E7Glq';

export default function mountUserEndpoints(router: Router) {
  // handle the user auth accordingly
  router.post('/signin', async (req: Request, res: Response) => {
    const auth = req.body.authResult;
    const userCollection = req.app.locals.userCollection;

    try {
      // Verify the user's access token with the /me endpoint:
      const me = await platformAPIClient.get(`https://api.minepi.com/v2/me`, { headers: { 'Authorization': `Bearer ${auth.accessToken}` } });
      console.log(me);
    } catch (err) {
      console.log(err);
      return res.status(401).json({ error: "Invalid access token" });
    }

    let currentUser = await userCollection.findOne({ uid: auth.user?.uid });

    if (currentUser) {
      await userCollection.updateOne(
        { _id: currentUser._id },
        { $set: { accessToken: auth.accessToken } }
      );
    } else {
      const insertResult = await userCollection.insertOne({
        username: auth.user.username,
        uid: auth.user?.uid,
        bio: "",
        coinBalance: 0,
        accessToken: auth.accessToken,
        communitiesCreated: [],
        communitiesJoined: [],
        likes: [],
        comments: [],
        posts: [],
        timestamp: new Date()
      });

      currentUser = await userCollection.findOne(insertResult.insertedId);
    }

    const token = jwt.sign({ uid: currentUser.uid, username: currentUser.username }, JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ message: "User signed in", token });
  });

  router.get('/signout', async (req: Request, res: Response) => {
    req.session.currentUser = null;
    return res.status(200).json({ message: "User signed out" });
  });

  router.get('/userInfo', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const userCollection = req.app.locals.userCollection;
    const currentUser = req.user;

    const user = await userCollection.findOne({ uid: currentUser.uid });
    if (!user) {
      return res.status(401).json({ error: "No current user found" });
    }
    return res.status(200).json({ username: user.username, bio: user.bio, coinBalance: user.coinBalance });
  });

  router.post('/update', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const { username, bio, coinBalance } = req.body;
    const userCollection = req.app.locals.userCollection;
    const user = req.user;

   //find the user and update the user in the database with new bio and username 
    const updatedUser = await userCollection
      .findOneAndUpdate(
        { uid: user.uid },
        { $set: { username, bio, coinBalance } },
        { returnDocument: 'after' }
      );     

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ message: "User updated successfully", user: updatedUser });
  });


  router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const currentUser = req.user;
      console.log('Current user:', currentUser);
      //find the user in the database that matches the currentUser uid
      const userCollection = req.app.locals.userCollection;
      const user = await userCollection.findOne({ uid: currentUser.uid });

      if (!currentUser) {
        console.log('No current user found');
        return res.status(401).json({ error: "No current user found" });
      }
  
      const communityCollection = req.app.locals.communityCollection;
      console.log('communityCollection:', communityCollection);
  
      // Ensure communitiesCreated exists and is an array
      if (!Array.isArray(user.communitiesCreated)) {
        console.log('communitiesCreated is not an array or is undefined:', currentUser.communitiesCreated);
        return res.status(400).json({ error: "Invalid communitiesCreated format" });
      }
  
      const communityIds = user.communitiesCreated.map((id: string) => {
        console.log('Mapping community ID:', id);
        return new Types.ObjectId(id);
      });
      console.log('Community IDs:', communityIds);
  
      const communities = await communityCollection.find({
        _id: { $in: communityIds }
      }).toArray();
  
      console.log('Communities fetched:', communities);
  
      const communityMap = communities.map((community: CommunityDocument) => ({
        _id: community._id.toString(),
        title: community.title,
        description: community.description,
        creator: community.creator,
        posts: community.posts,
      }));
      console.log('Community map:', communityMap);
  
      return res.status(200).json(communityMap);
    } catch (err) {
      console.error('Error in /me route:', err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  router.post('/joinCommunity', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { communityId } = req.body;
      const userCollection = req.app.locals.userCollection;
      const currentUser = req.user;
      const user = await userCollection.findOne({ uid: currentUser.uid });

      const updatedUser = await userCollection.findOneAndUpdate(
        { uid: user.uid },
        { $addToSet: { communitiesJoined: new Types.ObjectId(communityId) } },
      );

      const communityCollection = req.app.locals.communityCollection;
      //add the user ot the members array in the community
      await communityCollection.findOneAndUpdate(
        { _id: new Types.ObjectId(communityId) },
        { $addToSet: { members: new Types.ObjectId(user._id) } }
      );

      return res.status(200).json({ message: "Community added to joined communities successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  router.post('/leaveCommunity', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { communityId } = req.body;
      const userCollection = req.app.locals.userCollection;
      const currentUser = req.user;
      const user = await userCollection.findOne({ uid: currentUser.uid });

      const updatedUser = await userCollection.findOneAndUpdate(
        { uid: user.uid },
        { $pull: { communitiesJoined: new Types.ObjectId(communityId) } },
      );
  
      const communityCollection = req.app.locals.communityCollection;
      await communityCollection.findOneAndUpdate(
        { _id: new Types.ObjectId(communityId) },
        { $pull: { members: new Types.ObjectId(user._id) } }
      );

      return res.status(200).json({ message: "Community removed from joined communities successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  );


  router.get('/joined',authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const currentUser = req.user;
      //get the community if from the req body
      const userCollection = req.app.locals.userCollection;
      const user = await userCollection.findOne({ uid: currentUser.uid });

      if (!currentUser) {
        return res.status(401).json({ error: "No current user found" });
      }

      const communityCollection = req.app.locals.communityCollection;

      const communities = await communityCollection.find({
        _id: { $in: user.communitiesJoined.map((id: string) => new Types.ObjectId(id)) }
      }).toArray();

      const communityMap = communities.map((community: CommunityDocument) => ({
        _id: community._id.toString(),
        title: community.title,
        description: community.description,
        creator: community.creator,
        posts: community.posts,
      }));

      if (!(communityMap === null)) {
        return res.status(200).json(communityMap);
      } else {
        return res.status(404).json({ error: "User has not joined any communities" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  router.get('/isFollowingCommunity/:communityId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { communityId } = req.body;
      const currentUser = req.user;
      const userCollection = req.app.locals.userCollection;
      const user = await userCollection.findOne({ uid: currentUser.uid });

      if (!currentUser) {
        return res.status(401).json({ error: "No current user found" });
      }

      if (user.communitiesJoined.includes(communityId)) {
        return res.status(200).json({ isFollowing: true });
      }

      return res.status(200).json({ isFollowing: false });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  );


  router.post('/addUser', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId, communityId } = req.body;
      const userCollection = req.app.locals.userCollection;

      const updatedUser = await userCollection.findOneAndUpdate(
        { uid: userId },
        { $addToSet: { communitiesJoined: new Types.ObjectId(communityId) } },
      );

      return res.status(200).json({updatedUser});

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  router.get('/username',authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const userCollection = req.app.locals.userCollection;
    const userId = req.query.user_id as string;

    try {
      const userObject = await userCollection.findOne({ uid: userId });
      if (!userObject) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(200).json({ username: userObject.username });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  router.get('/liked', async (req: Request, res: Response) => {
    const userCollection = req.app.locals.userCollection;
    const userId = req.query.user_id as string;
    const postId = req.query.post_id as string;

    try {
      const userObject = await userCollection.findOne({ uid: userId });
      if (!userObject) {
        return res.status(404).json({ error: "User not found" });
      }
      const liked = userObject.likes.includes(new Types.ObjectId(postId));
      return res.status(200).json({ liked });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
}
