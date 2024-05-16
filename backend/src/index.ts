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
import mountUserEndpoints from './handlers/users';
import mountCommunityEndpoints from './handlers/community';
import mountPostEndpoints from './handlers/posts';
import mountCommentEndpoints from './handlers/comments';
import "./types/session";

const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error('MongoDB URI not defined in environment variables');
    process.exit(1); // Exit if no MongoDB URI is defined
}

// MongoDB connection
mongoose.connect(mongoURI)
//print mongodb connection status
    .then(() => {console.log('Connected to MongoDB URI:', (mongoURI)); })
    .catch((err: Error) => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit if cannot connect to MongoDB
    });

const app = express();

app.use(logger('dev'));
app.use(logger('common', {
  stream: fs.createWriteStream(path.join(__dirname, '..', 'log', 'access.log'), { flags: 'a' }),
}));

app.use(express.json());
app.use(cors({
  origin: env.frontend_url,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log('Backend listening on port 3000!');
    console.log(`CORS configured for ${env.frontend_url}`);
});
