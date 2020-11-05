"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
require("express-async-errors");
const routes_1 = __importDefault(require("./routes"));
const handler_1 = __importDefault(require("./errors/handler"));
dotenv_1.default.config();
const app = express_1.default();
app.use(cors_1.default());
app.use(express_1.default.json());
app.use(routes_1.default);
app.use(handler_1.default);
app.listen(process.env.PORT || 80);
console.log(`Servindo vegas-trader-api na porta: ${process.env.PORT || 80}`);
