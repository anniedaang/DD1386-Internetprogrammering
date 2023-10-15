import { Router } from "express";
import bcrypt from "bcrypt";
import db from "../db.js";
import { readFile, resolvePath } from "../util.js";
import sessionManager from "../sessionManager.js";

const publicRouter = Router();
const saltRounds = 10;

// <<<<<<<<<<GET REQUESTS /REGISTER>>>>>>>>>>
publicRouter.get("/register", async (req, res) => {
  console.log("REGISTER GET REQUEST");
  console.log(req.headers);

  // check if there's a cookie and if the cookie is connected to a user that is logged in, send the user to the profile page
  if (req.headers.cookie) {
    if (sessionManager.getUsername(req.headers.cookie.split("=")[1])) {
      res.redirect("/");
      return;
    }
  }
  const htmlDoc = await readFile(resolvePath("public", "register.html"));
  res.status(200).send(htmlDoc);
});

// <<<<<<<<<<POST REQUESTS /REGISTER>>>>>>>>>>
publicRouter.post("/register", async (req, res) => {
  console.log("REGISTER POST REQUEST");
  console.log(req.headers);

  // parse the username and password that the user entered
  const { username } = req.body;
  const { password } = req.body;
  const { confirm } = req.body;

  // check if username and password are valid, then redirect to login page
  // username and password must be at least 3 characters long, contain at least one number, and contain at least one letter
  if (
    username.length < 3 ||
    !username.match(/[0-9]/g) ||
    !username.match(/[a-zA-Z]/g)
  ) {
    res.redirect(
      "/register?error=* Username must be at least 3 characters long \n * Username must contain at least one number \n * Username must contain at least one letter"
    );
  } else if (
    password.length < 3 ||
    !password.match(/[0-9]/g) ||
    !password.match(/[a-zA-Z]/g)
  ) {
    res.redirect(
      "/register?error=* Password must be at least 3 characters long \n * Password must contain at least one number \n * Password must contain at least one letter"
    );
  } else if (password !== confirm) {
    res.redirect("/register?error=Passwords do not match");
  } else {
    console.log("Username and password are valid");

    // check if the username is unique, otherwise redirect to register page
    let uniqueInput = true;

    // Defends against SQL injection, treat data as a parameter and does not interfere with parsing the query
    await db.each(
      "SELECT * FROM lorem WHERE username = (?)",
      username,
      (err) => {
        if (err) {
          throw new Error(err);
        }
        uniqueInput = false;
      }
    );

    if (uniqueInput) {
      console.log("Username is unique");

      // salted and hashed password
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await db.run("INSERT INTO lorem (username, password) VALUES (?, ?)", [
        username,
        hashedPassword,
      ]);
      res.redirect("/login?success=Succesfully registered");
    } else {
      console.log("Username is not unique");
      res.redirect("/register?error=Username already exists");
    }
  }
});

export default {
  publicRouter,
};
