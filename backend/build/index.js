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
        while (_) try {
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
var mongodb_1 = require("mongodb");
var environments_1 = __importDefault(require("./environments"));
var payments_1 = __importDefault(require("./handlers/payments"));
var users_1 = __importDefault(require("./handlers/users"));
var community_1 = __importDefault(require("./handlers/community"));
var posts_1 = __importDefault(require("./handlers/posts"));
var comments_1 = __importDefault(require("./handlers/comments"));
// We must import typedefs for ts-node-dev to pick them up when they change (even though tsc would supposedly
// have no problem here)
// https://stackoverflow.com/questions/65108033/property-user-does-not-exist-on-type-session-partialsessiondata#comment125163548_65381085
require("./types/session");
var dbName = environments_1.default.mongo_db_name;
var mongoUri = "mongodb://".concat(environments_1.default.mongo_host, "/").concat(dbName);
var mongoClientOptions = {
    authSource: "admin",
    auth: {
        username: environments_1.default.mongo_user,
        password: environments_1.default.mongo_password,
    },
};
//
// I. Initialize and set up the express app and various middlewares and packages:
//
var app = (0, express_1.default)();
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
        dbName: dbName,
        collectionName: 'user_sessions'
    }),
}));
//
// II. Mount app endpoints:
// Payments endpoint under /payments:
var paymentsRouter = express_1.default.Router();
(0, payments_1.default)(paymentsRouter);
app.use('/payments', paymentsRouter);
// User endpoints (e.g signin, signout) under /user:
var userRouter = express_1.default.Router();
(0, users_1.default)(userRouter);
app.use('/user', userRouter);
console.log("hi3");
// Community endpoints under /community:
var communityRouter = express_1.default.Router();
(0, community_1.default)(communityRouter);
app.use('/community', communityRouter);
var postRouter = express_1.default.Router();
(0, posts_1.default)(postRouter);
app.use('/posts', postRouter);
var commentRouter = express_1.default.Router();
(0, comments_1.default)(commentRouter);
app.use('/comments', commentRouter);
// Hello World page to check everything works:
app.get('/', function (_, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.status(200).send({ message: "Hello, World!" });
        return [2 /*return*/];
    });
}); });
// III. Boot up the app:
app.listen(3333, function () { return __awaiter(void 0, void 0, void 0, function () {
    var client, db, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, mongodb_1.MongoClient.connect(mongoUri, mongoClientOptions)];
            case 1:
                client = _a.sent();
                db = client.db(dbName);
                app.locals.orderCollection = db.collection('orders');
                app.locals.userCollection = db.collection('users');
                //adding communities to the database, you can see the fields of communities in the types folder
                app.locals.communityCollection = db.collection('communities');
                app.locals.postCollection = db.collection('posts');
                app.locals.commentCollection = db.collection('comments');
                // app.locals.likeCollection = db.collection('likes');
                console.log('Connected to MongoDB on: ', mongoUri);
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                console.error('Connection to MongoDB failed: ', err_1);
                return [3 /*break*/, 3];
            case 3:
                console.log("App platform demo app - Backend listening on port 3333!");
                console.log("CORS config: configured to respond to a frontend hosted on ".concat(environments_1.default.frontend_url));
                return [2 /*return*/];
        }
    });
}); });
