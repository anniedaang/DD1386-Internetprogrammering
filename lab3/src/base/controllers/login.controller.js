import { Router } from "express";
import bcrypt from "bcrypt";
import db from "../db.js";
import sessionManager from "../sessionManager.js";
import { readFile, resolvePath } from "../util.js";

const publicRouter = Router();
const privateRouter = Router();

// <<<<<<<<<<GET REQUESTS /LOGIN>>>>>>>>>>
publicRouter.get("/login", async (req, res) => {
  console.log("LOGIN GET REQUEST");
  console.log(req.headers);

  // check if there's a cookie and if the cookie is connected to a user that is logged in, send the user to the profile page
  if (req.headers.cookie) {
    if (sessionManager.getUsername(req.headers.cookie.split("=")[1])) {
      res.redirect("/");
      return;
    }
  }
  const htmlDoc = await readFile(resolvePath("public", "login.html"));
  res.status(200).send(htmlDoc);
});

// <<<<<<<<<<POST REQUESTS /LOGIN>>>>>>>>>>
publicRouter.post("/login", async (req, res) => {
  // parse the username and password that the user entered
  const { username } = req.body; // const username = Object.values(req.body)[0];
  const { password } = req.body; // const password = Object.values(req.body)[1];

  // check if username exist in database and if password is correct
  let usernameExist = false;
  let correctPassword = false;
  let hashedPassword = null;

  // check if the username is in the database
  // db.run vs db.each (kolla return value)
  await db.each(
    "SELECT * FROM lorem WHERE username = (?)",
    username,
    (err, row) => {
      if (err) {
        throw new Error(err);
      }
      usernameExist = true;
      hashedPassword = row.password;
    }
  );

  // if the username exists in the database, check if the password is correct
  if (usernameExist && (await bcrypt.compare(password, hashedPassword))) {
    correctPassword = true;
  }

  // if the username does not exist, or the password is incorrect, redirect to login page
  if (!usernameExist || !correctPassword) {
    res.redirect(
      "/login?error=Username does not exist or password is incorrect"
    );
  } else {
    const session = sessionManager.createNewSession(username); // create a new session, cookie is returned
    sessionManager.activeSessionsTracker(username); // increment the number of active sessions for the user
    res.cookie("session-id", session.id).redirect("/"); // redirect to profile page
  }
});

// <<<<<<<<<<POST REQUESTS /LOGOUT>>>>>>>>>>
privateRouter.post("/logout", (req, res) => {
  const username = sessionManager.getUsername(req.headers.cookie.split("=")[1]); // get the username from the cookie
  console.log(`The user ${username} has logged out`);

  sessionManager.deleteSession(req.headers.cookie.split("=")[1]); // delete the session

  res.redirect("/login?success=User logged out"); // redirect to login page
});

export default {
  publicRouter,
  privateRouter,
};
