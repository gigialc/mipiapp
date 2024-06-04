// Date: 2021-08-31
// Description: This file contains the endpoints for the community collection.
// Creator: Gigi

// Community endpoints under /community
import { Router } from "express";
import { Types } from "mongoose";
import Community from "../models/community"; // Import the Community model
import User from "../models/user"; // Import the User model
import "../types/session"; // Ensure session types are imported
import { CommunityType } from "../types/community"; // Import the CommunityType
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, authenticateToken } from '../Middleware/auth';
import mongoose from "mongoose";
import { Response } from 'express';

const router = Router();
const JWT_SECRET =  process.env.JWT_SECRET || 'UaIh0qWFOiKOnFZmyuuZ524Jp74E7Glq';

const ObjectId = mongoose.Types.ObjectId;

export default function mountCommunityEndpoints(router: Router) {
    router.get('/create', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
        try {
            const communities = await Community.find({}, 'name description').exec(); // Fetch only needed fields
            return res.status(200).json({ communities });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching communities", error });
        }
    });

    router.post('/create', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
        try {
            const currentUser = req.user;
            const userCollection = req.app.locals.userCollection;
            const creatorId = currentUser?.uid;
            const community = req.body;

            if (!creatorId) {
                return res.status(401).json({ error: 'unauthorized', message: "User needs to sign in first" });
            }

            const creatorData = await User.findOne({ uid: creatorId }).exec();
            if (!creatorData) {
                return res.status(404).json({ error: 'User not found', message: "The user does not exist in the database" });
            }

            const communityData = new Community({
                name: community.name,
                description: community.description,
                user: creatorData._id,
                price: community.price,
                moderators: community.moderators,
                members: community.members,
                invited: community.invited,
                posts: community.posts,
                rules: community.rules,
                tags: community.tags,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const newCommunity = await communityData.save();

            // Update the user's document to include this new community's ID in their list of created communities
            await User.updateOne(
                { _id: creatorData._id },
                { $push: { communitiesCreated: newCommunity._id } }
            );

            // // Optionally, update the session's currentUser with the latest user data
            // user = await User.findById(creatorData._id).exec();

            return res.status(200).json({ newCommunity });
        } catch (error) {
            console.error(error);
            return res.status(400).json({ message: "Error creating community", error });
        }
    });

    // Adding an array of posts to a community
    router.post('/posts', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
        const { community_id, post } = req.body;

        if (!community_id || !post) {
            return res.status(400).json({ error: 'bad request', message: "Missing community ID or post data" });
        }

        try {
            const updatedCommunity = await Community.findByIdAndUpdate(
                community_id,
                { $push: { posts: post } },
                { new: true }
            ).exec();

            if (!updatedCommunity) {
                return res.status(404).json({ error: 'not found', message: "Community not found" });
            }

            return res.status(200).json({ updatedCommunity });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'internal server error', message: "An error occurred while updating the community" });
        }
    });

    // Get the array of posts from a community
    router.get('/posts', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
        const currentUser = req.user;
        const userCollection = req.app.locals.userCollection;
        if (!currentUser) {
            return res.status(401).json({ error: 'unauthorized', message: "User needs to sign in first" });
        }

        const communityId = req.query.community_id as string;

        if (!communityId) {
            return res.status(400).json({ error: 'bad request', message: "Missing community ID" });
        }

        try {
            const community = await Community.findById(communityId).exec();

            if (!community) {
                return res.status(404).json({ error: 'not found', message: "Community not found" });
            }

            return res.status(200).json({ posts: community.posts });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'internal server error', message: "An error occurred while retrieving the community's posts" });
        }
    });

    router.get('/hi', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
        const currentUser = req.user;
        const userCollection = req.app.locals.userCollection;
        try {
            if (!currentUser) {
                return res.status(401).json({ error: 'unauthorized', message: "User needs to sign in first" });
            }

            const creatorId = currentUser?.uid;
            const communities = await Community.find({}).exec();

            const filteredCommunities = communities.filter((community: CommunityType) => {
                return community.user?.uid !== creatorId;
            });

            return res.status(200).json(filteredCommunities);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching communities", error });
        }
    });

    router.get('/username', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
        try {
            const communities = await Community.find({}).exec();
            const userId = communities.map(community => community.user.username); // Assuming `user` is populated
            return res.status(200).json({ communities, userId });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching communities", error });
        }
    });

    router.get('/community/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
        try {
            const community = await Community.findById(req.params.id).exec();
            if (!community) {
                return res.status(404).json({ error: 'Community not found' });
            }
            return res.status(200).json(community);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching community", error });
        }
    });

    router.put('/community/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
        try {
            const updatedCommunity = await Community.findByIdAndUpdate(
                req.params.id,
                req.body.community,
                { new: true }
            ).exec();
            return res.status(200).json({ updatedCommunity });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error updating community", error });
        }
    });

    router.delete('/community/:id',authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
        try {
            const deleteResult = await Community.findByIdAndDelete(req.params.id).exec();
            return res.status(200).json({ deleteResult });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error deleting community", error });
        }
    });

    // Adding user to a community
    router.post('/community/:id/addUser', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
        const currentUser = req.user;
        const user_id = currentUser?.uid;
        const { community_id } = req.params;
        try {
            const community = await Community.findById(community_id).exec();
            if (!community) {
                return res.status(404).json({ message: "Community not found" });
            }
            if (community.members.includes(user_id)) {
                return res.status(200).json({ message: "User is already a member" });
            }
            community.members.push(user_id);
            await community.save();
            return res.status(200).json({ updatedCommunity: community });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error adding user to community", error });
        }
    });

    router.post('/community/:id/leave', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
        const { user } = req.body;
        try {
            const community = await Community.findById(req.params.id).exec();
            if (!community) {
                return res.status(404).json({ message: "Community not found" });
            }
            if (!community.members.includes(user?.uid)) {
                return res.status(404).json({ message: "User is not a member of this community" });
            }
            const updatedMembers = community.members.filter(member => member !== user?.uid);
            community.members = updatedMembers;
            await community.save();
            return res.status(200).json({ updatedCommunity: community });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error removing user from community", error });
        }
    });

    router.post('/community/:id/post', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
        const { post } = req.body;
        try {
            const updatedCommunity = await Community.findByIdAndUpdate(
                req.params.id,
                { $push: { posts: post } },
                { new: true }
            ).exec();
            return res.status(200).json({ updatedCommunity });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error adding post to community", error });
        }
    });

}

