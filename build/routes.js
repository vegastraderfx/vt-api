"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CustomerController_1 = __importDefault(require("./controllers/CustomerController"));
const routes = express_1.Router();
routes.get("/", CustomerController_1.default.helloWorld);
routes.post("/customer/create-billing", CustomerController_1.default.register);
exports.default = routes;
