import fs from 'fs';
import path from 'path';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import logger from 'morgan';
import MongoStore from 'connect-mongo';
import { MongoClient } from 'mongodb';
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

// We must import typedefs for ts-node-dev to pick them up when they change (even though tsc would supposedly
// have no problem here)
// https://stackoverflow.com/questions/65108033/property-user-does-not-exist-on-type-session-partialsessiondata#comment125163548_65381085
import "./types/session";


const mongoUri = env.MONGO_URI;
const mongoClientOptions = {
  authSource: "admin",
  auth: {
    username: env.mongo_user,
    password: env.mongo_password,
  },
}


//
// I. Initialize and set up the express app and various middlewares and packages:
//

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

// Handle cookies 🍪
app.use(cookieParser());

// Use sessions:
app.use(session({
  secret: env.session_secret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongoUri,
    mongoOptions: mongoClientOptions,
    collectionName: 'user_sessions'
  }),
}));


//
// II. Mount app endpoints:
//

// Payments endpoint under /payments:
const paymentsRouter = express.Router();
mountPaymentsEndpoints(paymentsRouter);
app.use('/api/payments', paymentsRouter);

const userRouter = express.Router();
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

// Hello World page to check everything works:
app.get('/api', async (_, res) => {
  res.status(200).send({ message: "Hello, World!" });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
  });


// III. Boot up the app:

app.listen(8000, async () => {
  try {
    const db = mongoose.connection.db;
    app.locals.userCollection = db.collection<UserData>('user');
    app.locals.communityCollection = db.collection<CommunityType>('community');
    app.locals.postCollection = db.collection<PostType>('posts');
    app.locals.commentCollection = db.collection<CommentType>('comments');

    console.log('Collections initialized');
    console.log('Connected to MongoDB on: ', mongoUri)
  } catch (err) {
    console.error('Connection to MongoDB failed: ', err)
  }

  console.log('App platform demo app - Backend listening on port 8000!');
  console.log(`CORS config: configured to respond to a frontend hosted on ${env.frontend_url}`);
});