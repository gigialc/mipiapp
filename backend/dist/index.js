import fs from 'fs';
import path from 'path';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import logger from 'morgan';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import env from './environments';
const app = express();
dotenv.config();
// Import routes and other utilities
import mountPaymentsEndpoints from './handlers/payments';
import mountUserEndpoints from './handlers/user';
import mountCommunityEndpoints from './handlers/community';
import mountPostEndpoints from './handlers/posts';
import mountCommentEndpoints from './handlers/comments';
// Import types
import { UserData } from './types/user';
import { CommunityType } from './types/community';
import { PostType } from './types/posts';
import { CommentType } from './types/comments';

// MongoDB connection
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('MongoDB URI not defined in environment variables');
    process.exit(1);
}

// MongoDB connection
mongoose.connect(mongoURI)
    .then(() => {
        console.log('Connected to MongoDB URI:', mongoURI);

        // Middleware setup
        app.use(cors({
            origin: "https://www.destigfemme.app",
            credentials: true
        }));
        app.use(express.json());
        app.use(session({
            secret: process.env.SESSION_SECRET || 'your_default_secret_value',
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({
                mongoUrl: mongoURI,
                collectionName: 'user_sessions'
            }),
        }));


        // Middleware to log request details
        app.use((req, res, next) => {
            console.log(`Received request: ${req.method} ${req.url}`);
            console.log('Headers:', req.headers);
            console.log('Body:', req.body);
            next();
        });

        // Initialize the database and collections
        const db = mongoose.connection.db;
        app.locals.userCollection = db.collection<UserData>('user');
        app.locals.communityCollection = db.collection<CommunityType>('community');
        app.locals.postCollection = db.collection<PostType>('posts');
        app.locals.commentCollection = db.collection<CommentType>('comments');

        console.log('Collections initialized');


           // Serve static files from the React app
        app.use(express.static(path.join(__dirname, '../../frontend/build')));

           // Routes
        const userRouter = express.Router();

        app.get('/api', async (_, res) => {
            res.status(200).send({ message: "Hello, World!" });
        });

        // Endpoint mounting
        const paymentsRouter = express.Router();
        mountPaymentsEndpoints(paymentsRouter);
        app.use('/api/payments', paymentsRouter);


        mountUserEndpoints(userRouter);
        app.use('/api/user', userRouter);

        const communityRouter = express.Router();
        mountCommunityEndpoints(communityRouter);
        app.use('/api/community', communityRouter);

        const postRouter = express.Router();
        mountPostEndpoints(postRouter);
        app.use('/api/posts', postRouter);

        const commentRouter = express.Router();
        mountCommentEndpoints(commentRouter);
        app.use('/api/comments', commentRouter);

        // The "catchall" handler: for any request that doesn't
        // match one above, send back React's index.html file.
        // Handle all other routes with React app
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
        });

        const port = process.env.PORT || 3001;
        app.listen(port, () => {
            console.log(`Backend listening on port ${port}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });