import fs from 'fs';
import path from 'path';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import logger from 'morgan';
import MongoStore from 'connect-mongo';
import env from './environments';
import mongoose from 'mongoose';
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

// Import typedefs for ts-node-dev to pick them up when they change
import "./types/session";

const mongoUri = env.MONGO_URI;

// Initialize and set up the express app and various middlewares and packages
const app: express.Application = express();

// Log requests to the console in a compact format
app.use(logger('dev'));

// Full log of all requests to /log/access.log
app.use(logger('common', {
  stream: fs.createWriteStream(path.join(__dirname, '..', 'log', 'access.log'), { flags: 'a' }),
}));

// Enable response bodies to be sent as JSON
app.use(express.json());

// Handle CORS
const allowedOrigins = ['https://www.destigfemme.app'];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Handle CORS
app.use(cors({
  origin: env.frontend_url,
  credentials: true,
}));

// Handle cookies
app.use(cookieParser());

// Use sessions
app.use(session({
  secret: env.session_secret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongoUri,
    mongoOptions: {
      authSource: "admin",
      auth: {
        username: env.mongo_user,
        password: env.mongo_password,
      },
    },
    collectionName: 'user_sessions'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Set to true in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Mount app endpoints
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

// Hello World page to check everything works
app.get('/', async (_, res) => {
  res.status(200).send({ message: "Hello, World!" });
});

// Serve frontend
app.use(express.static(path.join(__dirname, '../../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

// Boot up the app
const startServer = async () => {
  try {
    // Connect to MongoDB using Mongoose
    await mongoose.connect(mongoUri, {
      authSource: "admin",
      user: env.mongo_user,
      pass: env.mongo_password,
    });

    // Initialize collections only after connection is established
    const db = mongoose.connection.db;

    app.locals.userCollection = db.collection<UserData>('user');
    app.locals.communityCollection = db.collection<CommunityType>('community');
    app.locals.postCollection = db.collection<PostType>('posts');
    app.locals.commentCollection = db.collection<CommentType>('comments');

    console.log('Collections initialized');
    console.log('Connected to MongoDB on: ', mongoUri);

    // Start the server
    app.listen(env.PORT, () => {
      console.log('App platform demo app - Backend listening on port ' + env.PORT);
      console.log(`CORS config: configured to respond to a frontend hosted on ${env.frontend_url}`);
    });
  } catch (err) {
    console.error('Connection to MongoDB failed: ', err);
    process.exit(1);
  }
};

startServer();

export default app;
