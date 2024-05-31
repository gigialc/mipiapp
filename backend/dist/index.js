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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const morgan_1 = __importDefault(require("morgan"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const environments_1 = __importDefault(require("./environments"));
const mongoose_1 = __importDefault(require("mongoose"));
const payments_1 = __importDefault(require("./handlers/payments"));
const user_1 = __importDefault(require("./handlers/user"));
const community_1 = __importDefault(require("./handlers/community"));
const posts_1 = __importDefault(require("./handlers/posts"));
const comments_1 = __importDefault(require("./handlers/comments"));
// We must import typedefs for ts-node-dev to pick them up when they change (even though tsc would supposedly
// have no problem here)
// https://stackoverflow.com/questions/65108033/property-user-does-not-exist-on-type-session-partialsessiondata#comment125163548_65381085
require("./types/session");
const mongoUri = environments_1.default.MONGO_URI;
const mongoClientOptions = {
    authSource: "admin",
    auth: {
        username: environments_1.default.mongo_user,
        password: environments_1.default.mongo_password,
    },
};
//
// I. Initialize and set up the express app and various middlewares and packages:
//
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
// Handle cookies 🍪
app.use((0, cookie_parser_1.default)());
// Use sessions:
app.use((0, express_session_1.default)({
    secret: environments_1.default.session_secret,
    resave: false,
    saveUninitialized: false,
    store: connect_mongo_1.default.create({
        mongoUrl: mongoUri,
        mongoOptions: mongoClientOptions,
        collectionName: 'user_sessions'
    }),
}));
//
// II. Mount app endpoints:
//
// Payments endpoint under /payments:
const paymentsRouter = express_1.default.Router();
(0, payments_1.default)(paymentsRouter);
app.use('/api/payments', paymentsRouter);
const userRouter = express_1.default.Router();
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
// Hello World page to check everything works:
app.get('/api', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send({ message: "Hello, World!" });
}));
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../frontend/build', 'index.html'));
});
// III. Boot up the app:
app.listen(8000, () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = mongoose_1.default.connection.db;
        app.locals.userCollection = db.collection('user');
        app.locals.communityCollection = db.collection('community');
        app.locals.postCollection = db.collection('posts');
        app.locals.commentCollection = db.collection('comments');
        console.log('Collections initialized');
        console.log('Connected to MongoDB on: ', mongoUri);
    }
    catch (err) {
        console.error('Connection to MongoDB failed: ', err);
    }
    console.log('App platform demo app - Backend listening on port 8000!');
    console.log(`CORS config: configured to respond to a frontend hosted on ${environments_1.default.frontend_url}`);
}));
