import { Router } from "express";
import sessionManager from "../sessionManager.js";
import { readFile, resolvePath } from "../util.js";

const privateRouter = Router();

// <<<<<<<<<<GET REQUESTS /PROFILE>>>>>>>>>>
privateRouter.get("/", async (req, res) => {
  console.log("PROFILE GET REQUEST");
  console.log(req.headers);

  const username = sessionManager.getUsername(req.headers.cookie.split("=")[1]);
  const activeSessions = sessionManager.getActiveSessions(username);

  console.log(`The user ${username} is logged in`);
  console.log(`the active sessions for ${username} is: ${activeSessions}`);

  // check how many active sessions the user has
  // if the user has 1 active session then send the profile page
  if (activeSessions === 1) {
    const htmlDoc = (
      await readFile(resolvePath("templates", "profile.html"))
    ).replace("$username$", username);

    res.status(200).send(htmlDoc);
  } else {
    // if the user has more than 1 active session then send to the profile page with extra button
    const divider =
      '<div id="logoutSessions"><a onclick="buttonRemoval()" id="logoutLink" href="javascript:void(0);">Sign out all other sessions</a></div>';
    const htmlDoc = (await readFile(resolvePath("templates", "profile.html")))
      .replace("$username$", username)
      .replace('<div id="logoutSessions"></div>', divider);

    res.status(200).send(htmlDoc);
  }
});

// <<<<<<<<<<GET REQUESTS /if the new link to log out all is pressed>>>>>>>>>>
privateRouter.get("/removeOtherUsers", (req, res) => {
  console.log("REMOVE OTHER USERS GET REQUEST");
  console.log(req.headers);

  const currentSessionID = req.headers.cookie.split("=")[1];
  const currentUsername = sessionManager.getUsername(currentSessionID);

  const allStoredId = Array.from(sessionManager.usernames.entries()); // get all the stored cookies and usernames [cookie, username]
  allStoredId.forEach(([storedCookieId, storedUsernameObject]) => {
    console.log(`storedCookieId: ${storedCookieId}`);
    console.log(`storedUsernameObject: ${storedUsernameObject}`);

    if (storedUsernameObject === currentUsername) {
      if (storedCookieId !== currentSessionID) {
        // remove all other sessions connected to the current username
        sessionManager.deleteSession(storedCookieId);
      }
    }
  });

  res.write("");
  res.send();
});

export default {
  privateRouter,
};
