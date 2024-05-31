const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

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
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'user_sessions'
  })
}));

// Import and use routes
const paymentsRouter = require('./handlers/payments');
const userRouter = require('./handlers/user');
const communityRouter = require('./handlers/community');
const postRouter = require('./handlers/posts');
const commentRouter = require('./handlers/comments');

app.use('/api/payments', paymentsRouter);
app.use('/api/user', userRouter);
app.use('/api/community', communityRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
