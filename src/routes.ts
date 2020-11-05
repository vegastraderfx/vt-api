import { Router } from "express";

import CustomerController from "./controllers/CustomerController";

const routes = Router();

routes.get("/", CustomerController.helloWorld);
routes.post("/customer/create-billing", CustomerController.register);

export default routes;
