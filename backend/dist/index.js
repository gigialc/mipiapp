"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
dotenv_1.default.config();
// Import routes and other utilities
const payments_1 = __importDefault(require("./handlers/payments"));
const user_1 = __importDefault(require("./handlers/user"));
const community_1 = __importDefault(require("./handlers/community"));
const posts_1 = __importDefault(require("./handlers/posts"));
const comments_1 = __importDefault(require("./handlers/comments"));
// MongoDB connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error('MongoDB URI not defined in environment variables');
    process.exit(1);
}
// MongoDB connection
mongoose_1.default.connect(mongoURI)
    .then(() => {
    console.log('Connected to MongoDB URI:', mongoURI);
    // Middleware setup
    app.use((0, cors_1.default)({
        origin: "https://www.destigfemme.app",
        credentials: true
    }));
    app.use(express_1.default.json());
    app.use((0, express_session_1.default)({
        secret: process.env.SESSION_SECRET || 'your_default_secret_value',
        resave: false,
        saveUninitialized: false,
        store: connect_mongo_1.default.create({
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
    const db = mongoose_1.default.connection.db;
    app.locals.userCollection = db.collection('user');
    app.locals.communityCollection = db.collection('community');
    app.locals.postCollection = db.collection('posts');
    app.locals.commentCollection = db.collection('comments');
    console.log('Collections initialized');
    // Serve static files from the React app
    app.use(express_1.default.static(path_1.default.join(__dirname, 'frontend/build')));
    // Routes
    const userRouter = express_1.default.Router();
    app.get('/api', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.status(200).send({ message: "Hello, World!" });
    }));
    // Endpoint mounting
    const paymentsRouter = express_1.default.Router();
    (0, payments_1.default)(paymentsRouter);
    app.use('/api/payments', paymentsRouter);
    (0, user_1.default)(userRouter);
    app.use('/api/user', userRouter);
    const communityRouter = express_1.default.Router();
    (0, community_1.default)(communityRouter);
    app.use('/api/community', communityRouter);
    const postRouter = express_1.default.Router();
    (0, posts_1.default)(postRouter);
    app.use('/api/posts', postRouter);
    const commentRouter = express_1.default.Router();
    (0, comments_1.default)(commentRouter);
    app.use('/api/comments', commentRouter);
    // The "catchall" handler: for any request that doesn't
    // match one above, send back React's index.html file.
    // Handle all other routes with React app
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, 'frontend/build', 'index.html'));
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
