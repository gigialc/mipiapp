"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var environments_1 = __importDefault(require("../environments"));
var platformAPIClient = axios_1.default.create({
    baseURL: environments_1.default.platform_api_url,
    timeout: 20000,
    headers: { 'Authorization': "Key ".concat(environments_1.default.pi_api_key) }
});
exports.default = platformAPIClient;
