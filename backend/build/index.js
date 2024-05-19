"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const morgan_1 = __importDefault(require("morgan"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const environments_1 = __importDefault(require("./environments"));
dotenv_1.default.config();
// Import routes and other utilities
const payments_1 = __importDefault(require("./handlers/payments"));
const user_1 = __importDefault(require("./handlers/user"));
const community_1 = __importDefault(require("./handlers/community"));
const posts_1 = __importDefault(require("./handlers/posts"));
const comments_1 = __importDefault(require("./handlers/comments"));
require("./types/session");
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error('MongoDB URI not defined in environment variables');
    process.exit(1); // Exit if no MongoDB URI is defined
}
// MongoDB connectiona
mongoose_1.default.connect(mongoURI)
    //print mongodb connection status
    .then(() => { console.log('Connected to MongoDB URI:', (mongoURI)); })
    .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if cannot connect to MongoDB
});
const app = (0, express_1.default)();
// Log requests to the console in a compact format:
app.use((0, morgan_1.default)('dev'));
// Full log of all requests to /log/access.log:
app.use((0, morgan_1.default)('common', {
    stream: fs_1.default.createWriteStream(path_1.default.join(__dirname, '..', 'log', 'access.log'), { flags: 'a' }),
}));
// Enable response bodies to be sent as JSON:
app.use(express_1.default.json());
// Handle CORS:
app.use((0, cors_1.default)({
    origin: environments_1.default.frontend_url,
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
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
// Endpoint mounting
const paymentsRouter = express_1.default.Router();
(0, payments_1.default)(paymentsRouter);
app.use('/payments', paymentsRouter);
const userRouter = express_1.default.Router();
(0, user_1.default)(userRouter);
app.use('/users', userRouter);
const communityRouter = express_1.default.Router();
(0, community_1.default)(communityRouter);
app.use('/community', communityRouter);
const postRouter = express_1.default.Router();
(0, posts_1.default)(postRouter);
app.use('/posts', postRouter);
const commentRouter = express_1.default.Router();
(0, comments_1.default)(commentRouter);
app.use('/comments', commentRouter);
app.get('/', async (_, res) => {
    res.status(200).send({ message: "Hello, World!" });
});
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`App platform demo app - Backend listening on port ${port}!`);
    console.log(`CORS configured for frontend hosted on ${environments_1.default.frontend_url}`);
});
