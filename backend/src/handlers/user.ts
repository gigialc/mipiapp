import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import Community, { CommunityDocument } from '../models/community';
import platformAPIClient from "../services/platformAPIClient";



export default function mountUserEndpoints(router: Router) {
  // handle the user auth accordingly
  router.post('/signin', async (req, res) => {
    const auth = req.body.authResult;
    const userCollection = req.app.locals.userCollection;

    try {
      // Verify the user's access token with the /me endpoint:
      const me = await platformAPIClient.get('https://api.minepi.com/v2/me', { headers: { 'Authorization': 'Bearer ${auth.accessToken}' } });
      console.log(me);
    } catch (err) {
      console.log(err);
      return res.status(401).json({error: "Invalid access token"}) 
    }

    let currentUser = await userCollection.findOne({ uid: auth.user?.uid });

    if (currentUser) {
      await userCollection.updateOne({
        _id: currentUser._id
      }, {
        $set: {
          accessToken: auth.accessToken,
        }
      });
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

    req.session.currentUser = currentUser;

    return res.status(200).json({ message: "User signed in" });
  });

  // handle the user auth accordingly
  router.get('/signout', async (req, res) => {
    req.session.currentUser = null;
    return res.status(200).json({ message: "User signed out" });
  });


  router.get('/userInfo', async (req, res) => {
    const currentUser = req.session.currentUser;
    if (!currentUser) {
      return res.status(401).json({ error: "No current user found" });
    }
    return res.status(200).json(currentUser);
  });

  router.post('/update', async (req, res) => {
    const currentUser = req.session.currentUser;
    if (!currentUser) {
      return res.status(401).json({ error: "No current user found" });
    }
    const userCollection = req.app.locals.userCollection;
    const { username, bio, coinBalance } = req.body;

    const updatedUser = await userCollection.findOneAndUpdate(
      { uid: currentUser.uid },
      { $set: { username, bio, coinBalance } },
      { new: true, returnDocument: 'after' }
    );

    if (!updatedUser.value) {
      return res.status(404).json({ error: "User not found" });
    }

    req.session.currentUser = updatedUser.value;
    return res.status(200).json({ message: "User updated successfully", user: updatedUser.value });
  });

  router.get('/me', async (req, res) => {
    try {
      const currentUser = req.session.currentUser;
      if (!currentUser) {
        return res.status(401).json({ error: "No current user found" });
      }

      const communityCollection = req.app.locals.communityCollection;

      const communities = await communityCollection.find({
        _id: { $in: currentUser.communitiesCreated.map(id => new Types.ObjectId(id)) }
      }).toArray();

      const communityMap = communities.map((community: CommunityDocument) => ({  // Explicitly define type
        _id: community._id.toString(),
        name: community.name,
        description: community.description,
        posts: community.posts,
      }));

        return res.status(200).json(communityMap);
     
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  router.get('/joined', async (req, res) => {
    try {
      const currentUser = req.session.currentUser;
      if (!currentUser) {
        return res.status(401).json({ error: "No current user found" });
      }

      const communityCollection = req.app.locals.communityCollection;

      const communities = await communityCollection.find({
        _id: { $in: currentUser.communitiesJoined.map(id => new Types.ObjectId(id)) }
      }).toArray();

      const communityMap = communities.map((community: CommunityDocument) => ({  // Explicitly define type
        _id: community._id.toString(),
        name: community.name,
        description: community.description,
        posts: community.posts,
      }));

      if (communityMap.length > 0) {
        return res.status(200).json(communityMap);
      } else {
        return res.status(404).json({ error: "User has not joined any communities" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  router.post('/addUser', async (req, res) => {
    try {
      const { userId, communityId } = req.body;
      const userCollection = req.app.locals.userCollection;

      const updatedUser = await userCollection.findOneAndUpdate(
        { uid: userId },
        { $addToSet: { communitiesJoined: new Types.ObjectId(communityId) } },
        { new: true, returnDocument: 'after' }
      );

      if (!updatedUser.value) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({ message: "Community added to joined communities successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  router.get('/username', async (req, res) => {
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

  router.get('/liked', async (req, res) => {
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
