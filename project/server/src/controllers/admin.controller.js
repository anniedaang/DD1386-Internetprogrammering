import { Router } from "express";
import SessionManager from "../base/sessionManager.js";
import model from "../model.js";

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
  const allDocuments = model.getDocumentsForAssistant(username);

  // appropriate HTTP response status code and send an HTTP response, if any, back to the client
  res.status(200).json({
    username,
    documents: allDocuments,
  });
});

// <<<<<<<<<<POST REQUESTS /LOGIN>>>>>>>>>>
router.post("/login", async (req, res) => {
  console.log("username: ", req.body.username);
  const user = model.findAssistantByUsername(req.body.username);
  console.log("this is the user ", user);

  if (!user) {
    // If the user is not found, respond with a 401 status code and indicate that the user is not authenticated
    res.status(401).json({ authenticated: false });
    return;
  }

  let userInformation = null;

  userInformation = model.logIn(req.body.username, req.body.password);
  // If the login information is correct, create a new session for the user, set a session cookie, and respond with a 200 status code
  if (userInformation) {
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

// <<<<<<<<<<POST REQUESTS /REGISTER>>>>>>>>>>
router.post("/register", async (req, res) => {
  // parse the uername, password and confirm from the request body
  const { username, password, confirm } = req.body;
  console.log("this is the username", username);
  console.log("this is the password", password);
  console.log("this is the confirm", confirm);

  let IsValidUsername = false;
  let IsValidPassword = false;

  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,}$/;
  IsValidUsername = regex.test(username);
  IsValidPassword = regex.test(password);

  // check if username and passwords are valid, and if the password and confirm match, send statustext and statuscode
  if (!IsValidUsername) {
    res.status(400).json({
      error:
        "Username must be at least 3 characters long and contain at least one number and one letter ",
    });
    return;
  }
  if (!IsValidPassword) {
    res.status(400).json({
      error:
        "Password must be at least 3 characters long and contain at least one number and one letter ",
    });
    return;
  }
  if (password !== confirm) {
    res
      .status(400)
      .json({ error: "Password and confirm password do not match" });
    return;
  }

  // check if the username already exists
  if (model.findAssistantByUsername(username)) {
    res.status(400).json({ error: "Username already exists" });
    return;
  }

  // add the new user to the database
  model.createAssistant(username, password);
  res.status(200).end();
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
