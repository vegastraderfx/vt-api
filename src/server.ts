import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "express-async-errors";

import routes from "./routes";
import errorHandler from "./errors/handler";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);
app.use(errorHandler);

app.listen(process.env.PORT || 80);
console.log(`Servindo vegas-trader-api na porta: ${process.env.PORT || 80}`);
