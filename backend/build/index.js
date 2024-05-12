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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var cors_1 = __importDefault(require("cors"));
var express_1 = __importDefault(require("express"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var express_session_1 = __importDefault(require("express-session"));
var morgan_1 = __importDefault(require("morgan"));
var connect_mongo_1 = __importDefault(require("connect-mongo"));
var mongoose_1 = __importDefault(require("mongoose"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Import routes and other utilities
var payments_1 = __importDefault(require("./handlers/payments"));
var users_1 = __importDefault(require("./handlers/users"));
var community_1 = __importDefault(require("./handlers/community"));
var posts_1 = __importDefault(require("./handlers/posts"));
var comments_1 = __importDefault(require("./handlers/comments"));
require("./types/session");
var mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error('MongoDB URI not defined in environment variables');
    process.exit(1); // Exit if no MongoDB URI is defined
}
// MongoDB connection
mongoose_1.default.connect(mongoURI)
    //print mongodb connection status
    .then(function () { console.log('Connected to MongoDB URI:', (mongoURI)); })
    .catch(function (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if cannot connect to MongoDB
});
var app = (0, express_1.default)();
app.use((0, morgan_1.default)('dev'));
app.use((0, morgan_1.default)('common', {
    stream: fs_1.default.createWriteStream(path_1.default.join(__dirname, '..', 'log', 'access.log'), { flags: 'a' }),
}));
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: 'https://destigfemme.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
// Endpoint mounting
var paymentsRouter = express_1.default.Router();
(0, payments_1.default)(paymentsRouter);
app.use('/payments', paymentsRouter);
var userRouter = express_1.default.Router();
(0, users_1.default)(userRouter);
app.use('/user', userRouter);
var communityRouter = express_1.default.Router();
(0, community_1.default)(communityRouter);
app.use('/community', communityRouter);
var postRouter = express_1.default.Router();
(0, posts_1.default)(postRouter);
app.use('/posts', postRouter);
var commentRouter = express_1.default.Router();
(0, comments_1.default)(commentRouter);
app.use('/comments', commentRouter);
app.get('/', function (_, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.status(200).send({ message: "Hello, World!" });
        return [2 /*return*/];
    });
}); });
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Backend listening on port 3000!');
    console.log("CORS configured for ".concat(process.env.FRONTEND_URL));
});
