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

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('MongoDB URI not defined in environment variables');
    process.exit(1); // Exit if no MongoDB URI is defined
}

// MongoDB connectiona
mongoose.connect(mongoURI)
//print mongodb connection status
    .then(() => {console.log('Connected to MongoDB URI:', (mongoURI)); })
    .catch((err: Error) => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit if cannot connect to MongoDB
    });


const app: express.Application = express();

// Log requests to the console in a compact format:
app.use(logger('dev'));

// Full log of all requests to /log/access.log:
app.use(logger('common', {
  stream: fs.createWriteStream(path.join(__dirname, '..', 'log', 'access.log'), { flags: 'a' }),
}));

// Enable response bodies to be sent as JSON:
app.use(express.json())

// Handle CORS:
app.use(cors({
  origin: env.frontend_url,
  credentials: true
}));

app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET|| 'your_default_secret_value',
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
  mongoose.connection.once('open', () => {
    const db = mongoose.connection.db;
    app.locals.userCollection = db.collection<UserData>('user');
    app.locals.communityCollection = db.collection<CommunityType>('community');
    app.locals.postCollection = db.collection<PostType>('posts');
    app.locals.commentCollection = db.collection<CommentType>('comments');

  console.log('Collections initialized');
});

// Endpoint mounting
const paymentsRouter = express.Router();
mountPaymentsEndpoints(paymentsRouter);
app.use('/payments', paymentsRouter);

const userRouter = express.Router();
mountUserEndpoints(userRouter);
app.use('/user', userRouter);

const communityRouter = express.Router();
mountCommunityEndpoints(communityRouter);
app.use('/community', communityRouter);

const postRouter = express.Router();
mountPostEndpoints(postRouter);
app.use('/posts', postRouter);

const commentRouter = express.Router();
mountCommentEndpoints(commentRouter);
app.use('/comments', commentRouter);

app.get('/', async (_, res) => {
  res.status(200).send({ message: "Hello, World!" });
});

const port = process.env.PORT || 3001

app.listen(port, () => {
  console.log(`App platform demo app - Backend listening on port ${port}!`);
  console.log(`CORS configured for frontend hosted on ${env.frontend_url}`);
});