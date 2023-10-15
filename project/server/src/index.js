import betterLogging from "better-logging";
import express from "express";
import expressSession from "express-session";
import socketIOSession from "express-socket.io-session";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import { resolvePath } from "./util.js";
import model from "./model.js";
import admin from "./controllers/admin.controller.js";
import timeslot from "./controllers/timeslot.controller.js";

const port = 8989;
const app = express();
const server = createServer(app);
const io = new Server(server);

const { Theme } = betterLogging;
betterLogging(console, {
  color: Theme.green,
});

// Use cookie-parser middleware
app.use(cookieParser());

// Enable debug output
console.logLevel = 4;

// Register a custom middleware for logging incoming requests
app.use(
  betterLogging.expressMiddleware(console, {
    ip: { show: true, color: Theme.green.base },
    method: { show: true, color: Theme.green.base },
    header: { show: false },
    path: { show: true },
    body: { show: true },
  })
);

// Configure session management
const sessionConf = expressSession({
  secret: "Super secret! Shh! Do not tell anyone...",
  resave: true,
  saveUninitialized: true,
});

app.use(sessionConf);
io.use(
  socketIOSession(sessionConf, {
    autoSave: true,
    saveUninitialized: true,
  })
);

// Serve static files
app.use(express.static(resolvePath("client", "dist")));

// Register middlewares that parse the body of the request, available under req.body property
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Bind REST controllers to /api/*
app.use("/api", admin.router);
app.use("/api", timeslot.router);

// Initialize a model
model.init(io);
model.allAssistants();
model.allDocuments();

// Initialize an empty object to store user activity timers
const userActivity = {};

// Set the amount of idle time before automatic logout (in milliseconds)
const IDLE_TIME = 30000; // 30 seconds

// Handle socket.io connections
io.on("connection", (socket) => {
  const { session } = socket.handshake;
  session.socketID = socket.id;
  session.save((err) => {
    if (err) console.error(err);
    else console.debug(`Saved socketID: ${session.socketID}`);
  });

  // Start a timer for this user when they connect
  userActivity[session.id] = setTimeout(() => {
    socket.emit("logout"); // emit a "logout" event to the client
    session.destroy((err) => {
      if (err) console.error(err);
      else console.debug(`Session destroyed for ${session.id}`);
    });
  }, IDLE_TIME);

  // Reset the timer for this user when they perform an activity
  socket.on("activity", () => {
    clearTimeout(userActivity[session.id]); // clear the old timer
    userActivity[session.id] = setTimeout(() => {
      socket.emit("logout"); // emit a "logout" event to the client
      session.destroy((err) => {
        if (err) console.error(err);
        else console.debug(`Session destroyed for ${session.id}`);
      });
    }, IDLE_TIME); // start a new timer
  });
});

server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}/`);
});
