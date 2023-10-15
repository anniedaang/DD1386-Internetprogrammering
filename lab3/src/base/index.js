import express from "express";
import { resolvePath } from "./util.js";
import logger from "./middlewares/logger.js";
import requireAuth from "./middlewares/requireAuth.js";
import loginController from "./controllers/login.controller.js";
import profileController from "./controllers/profile.controller.js";
import registerController from "./controllers/register.controller.js";

const port = 8989;
const app = express();

// Register a custom middleware for logging incoming requests
app.use(logger);

// Serve static files
app.use(express.static(resolvePath("public")));

// Register a middleware that parses the body of the request, available under req.body property
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(loginController.publicRouter);
app.use(registerController.publicRouter);
app.use(requireAuth, loginController.privateRouter);
app.use(requireAuth, profileController.privateRouter);

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}/`);
});
