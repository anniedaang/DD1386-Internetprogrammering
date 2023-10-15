import { Router } from "express";
import SessionManager from "../base/sessionManager.js";
import model from "../model.js";
import db from "../base/db.js";

const router = Router();
// middleware that is specific to this router
const requireAuth = (req, res, next) => {
  const sessionId = req.cookies["session-id"];
  const user = SessionManager.getUsername(sessionId);

  if (!user) {
    res.status(401).end();
    console.log("User not logged in");
    return;
  }
  next();
};

router.get("/users/me", (req, res) => {
  if (req.session.authenticated) {
    res
      .status(200)
      .json({ authenticated: true, username: req.session.username });
  } else {
    res.status(200).json({ authenticated: false });
  }
});

// <<<<<<<<<<GET REQUESTS /LOGIN>>>>>>>>>>
router.get("/login", async (req, res) => {
  const sessionId = req.cookies["session-id"];
  const user = SessionManager.findSessionById(sessionId);

  res.status(200).json({ authenticated: !!user });
});

// <<<<<<<<<<GET REQUESTS /ADMIN>>>>>>>>>>
router.get("/admin", async (req, res) => {
  const sessionId = req.cookies["session-id"];
  const username = SessionManager.getUsername(sessionId);
  const allTimeslots = model.getTimesForAssistant(username);

  // appropriate HTTP response status code and send an HTTP response, if any, back to the client
  res.status(200).json({
    username,
    timeslots: allTimeslots,
  });
});

// <<<<<<<<<<POST REQUESTS /LOGIN>>>>>>>>>>
router.post("/login", async (req, res) => {
  console.log(req.body.username);
  const user = model.findAssistantByUsername(req.body.username);
  console.log("this is the user ", user);

  if (!user) {
    // If the user is not found, respond with a 401 status code and indicate that the user is not authenticated
    res.status(401).json({ authenticated: false });
    return;
  }

  let correctInformation = null;

  // Use a SQLite placeholder to defend against SQL injections, and query the Assistants table for the provided username
  await db.each(
    "SELECT * FROM Assistants WHERE username = ?",
    [req.body.username],
    (err, row) => {
      if (err) {
        throw new Error(err);
      }
      correctInformation = row;
    }
  );
  // Check if the correct information was found, and if the provided password matches the password in the database
  if (
    correctInformation != null &&
    req.body.password === correctInformation.password
  ) {
    // If the login information is correct, create a new session for the user, set a session cookie, and respond with a 200 status code
    const session = SessionManager.createNewSession(req.body.username); // Create a new session for the user
    res
      .cookie("session-id", session.id)
      .status(200)
      .json({ authenticated: true, username: req.body.username });
    console.log("LOGIN SUCCESSFUL");
  } else {
    // If the login information is incorrect, respond with a 401 status code and indicate that the user is not authenticated
    res.status(401).json({ authenticated: false });
    console.log("LOGIN FAILED");
  }
});

/* <<<<<<<<<<DELETE REQUESTS /admin/logout>>>>>>>>>>
 * logs out the user
 */
router.delete("/admin/logout", async (req, res) => {
  const sessionId = req.cookies["session-id"];
  SessionManager.deleteSession(sessionId);
  req.session.authenticated = false;
  req.session.username = null;
  console.log("user are logged out");
  res.status(200).end();
});

export default { router, requireAuth };
