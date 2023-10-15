import { Router } from "express";
import { Server } from "socket.io";
import db from "../base/db.js";
import model from "../model.js";
import SessionManager from "../base/sessionManager.js";

const router = Router();
const timerList = {};
// Set up WebSocket server
const io = new Server();
io.on("connection", (socket) => {
  console.log("A user connected.");
});

/**
 * API (see the route handlers below) should combine uniquely identifiable resources (paths)
 * with the appropriate HTTP request methods (GET, POST, PUT, DELETE and more) to manipulate them.
 *
 * GET     /showtimeslots                => Get all timeslots
 * GET     /showtimeslots/:id            => Get a specific timeslot
 * POST    /showtimeslots                => Create a new timeslot
 * PUT     /showtimeslots/:id            => Update a specific timeslot
 * etc.
 * */

// <<<<<<<<<<GET REQUESTS /SHOWTIMESLOTS>>>>>>>>>>
router.get("/showtimeslots", async (req, res) => {
  console.log("YOU ARE IN THE /showtimeslots GET REQUEST");
  const allTimeslots = model.getTimeslots();
  res.status(200).json({ timeslots: allTimeslots });
});

/* <<<<<<<<<<GET REQUESTS for a specific timeslot>>>>>>>>>>
 * authenticates and returns the timeslot if it is available
 */
router.get("/showtimeslots/:timeslotID", async (req, res) => {
  const { timeslotID } = req.params; // Get the timeslotID from the request parameters
  console.log(`timeslotID is: ${timeslotID}`);

  // Use a SQLite placeholder to defend against SQL injections, and query the Timeslots table for the provided timeslotID
  const timeslot = model.findTimeslotByID(timeslotID);

  // appropriate HTTP response status code and send an HTTP response, if any, back to the client
  if (timeslot) {
    res.status(200).json({ timeslot });
  } else {
    res.status(400).end();
  }
});

// <<<<<<<<<<GET REQUESTS for booking a specific timeslot>>>>>>>>>>
router.get("/reserving/:timeslotID", async (req, res) => {
  const { timeslotID } = req.params; // Get the timeslotID from the request parameters
  const timeslot = model.findTimeslotByID(timeslotID);

  const condition = timeslot.booked; // condition is false if the timeslot is not booked

  if (condition) {
    // if the timeslot is booked, send a 400 response
    res.status(400).end();
  } else {
    // if the timeslot is not booked, send a 200 response
    timeslot.setBookedBy("reserved");
    model.broadcast("reserved", timeslot);

    // set timer
    timerList[timeslot.timeslotID] = setTimeout(() => {
      timeslot.unbook();
    }, 10000); // 10 seconds

    res.status(200).json({ timeslot });
  }
});

// <<<<<<<<<<GET REQUESTS for time out for a specific timeslot>>>>>>>>>>
router.get("/close/:timeslotID", async (req, res) => {
  const { timeslotID } = req.params; // Get the timeslotID from the request parameters
  const timeslot = model.findTimeslotByID(timeslotID);
  model.broadcast("reservationTimeout", timeslot);
  res.sendStatus(200);
});

// <<<<<<<<<<GET REQUESTS for finalized booking>>>>>>>>>>
router.get("/saved/:id", async (req, res) => {
  const { id } = req.params; // Get the document id from the request parameters
  const document = model.findTimeslotByID(id);
  model.broadcast("newUpdate", document);
  res.sendStatus(200);
});

/* <<<<<<<<<<POST REQUESTS /BOOKING>>>>>>>>>>
 * when a user tries to book a timeslot

router.post("/booking/:timeslotID", async (req, res) => {
  const { timeslotID } = req.params;
  const studentname = req.body.name;
  const currentTimeslot = model.findTimeslotByID(timeslotID);

  if (currentTimeslot.booked && currentTimeslot.bookedBy !== "reserved") {
    res.status(403).end();
    return;
  }

  // unset the timer when the booking is confirmed
  const id = timerList[currentTimeslot.timeslotID];
  if (id) {
    clearTimeout(id);
  }

  currentTimeslot.setBookedBy(studentname);
  model.updateDatabase(currentTimeslot); // update the database
  model.broadcast("reserved", currentTimeslot);
  res.status(200).end();
}); */

// <<<<<<<<<<POST REQUESTS NEW SAVE>>>>>>>>>>
router.post("/document/:id", async (req, res) => {
  const { id } = req.params;
  const content = req.body.content;
  const currentDocument = model.findTimeslotByID(id);
  console.log("HÄR ÄR DU", currentDocument.id);

  if (currentDocument.id) {
    currentDocument.setContent(content);
    model.updateDatabase(currentDocument, content);
    model.broadcast("newUpdate", currentDocument);
    console.log("DU TOG DIG HIT");
    res.status(200).end()
  } else {
    res.status(500).jsonp({ message: "Internal SQL Error" });
    throw new Error(message);
  }
});

/* <<<<<<<<<<PUT REQUESTS /admin/addtimeslot>>>>>>>>>>
 * authenticates and adds a new timeslot to the database
router.put("/admin/addtimeslot", async (req, res) => {
  console.log("YOU ARE IN THE /admin/addtimeslot PUT REQUEST");
  try {
    const { time } = req.body;
    const cookie = req.cookies["session-id"];
    const assistantName = SessionManager.getUsername(cookie);

    if (assistantName === undefined) {
      res.status(500).jsonp({ message: "Internal SQL Error" });
      throw new Error(message);
    } else {
      const doublebooked = await db.get(
        "SELECT * FROM Timeslots WHERE assistantName = ? AND time = ?",
        [assistantName, time],
        (err) => {
          if (err) {
            res.status(500).jsonp({ message: "Internal SQL Error" });
            throw new Error(err);
          }
        }
      );

      if (doublebooked === undefined) {
        model.createTimeslot(assistantName, time); // Create a new timeslot in the model (also adds it to the database)
        const newTimeslot = await db.get(
          "SELECT * FROM Timeslots WHERE assistantName = ? AND time = ?",
          [assistantName, time]
        );
        model.broadcast("newUpdate", "New timeslot added");
        res.status(200).jsonp({ timeslot: newTimeslot });
        return;
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).jsonp({ message: "Internal SQL Error" });
  }
});*/

router.put("/admin/createnewdocument", async (req, res) => {
  try {
    const title = req.body.title;
    const cookie = req.cookies["session-id"];
    const assistantName = SessionManager.getUsername(cookie);

    if (assistantName === undefined) {
      res.status(500).jsonp({ message: "Internal SQL Error" });
      throw new Error(message);
    } else {
      const duplicateName = await db.get(
        "SELECT * FROM Documents WHERE assistantName = ? AND title = ?",
        [assistantName, title],
        (err) => {
          if (err) {
            res.status(500).jsonp({ message: "Internal SQL Error" });
            throw new Error(err);
          }
        }
      );

      if (duplicateName === undefined) {
        model.createTimeslot(assistantName, title); // Create a new document in the model (also adds it to the database)
        const newDocument = await db.get(
          "SELECT * FROM Documents WHERE assistantName = ? AND title = ?",
          [assistantName, title]
        );

        model.broadcast("newUpdate", "New document added");
        res.status(200).jsonp({ document: newDocument });
        return;
      } 
    }
  } catch (err) {
    console.log(err);
    res.status(500).jsonp({ message: "Internal SQL Error" });
  }
});

/* <<<<<<<<<<DELETE REQUESTS /admin/deletetimeslot/:id>>>>>>>>>>
 * delete a specific timeslot
 */
router.delete("/admin/deletetimeslot/:timeslotID", async (req, res) => {
  console.log("YOU ARE IN THE /admin/deletetimeslot PUT REQUEST");
  const { timeslotID } = req.params; // Get the timeslotID from the request parameters
  const cookie = req.cookies["session-id"];
  const assistantName = SessionManager.getUsername(cookie);

  if (assistantName === undefined) {
    res.status(500).jsonp({ message: "user not authenticated" });
    return;
  }

  const timeslot = model.findTimeslotByID(timeslotID);
  const condition =
    timeslot.assistantName === assistantName &&
    timeslot.bookedBy !== "reserved";

  if (condition) {
    model.deleteTimeslot(timeslotID); // Delete the timeslot from the model (also deletes it from the database
    model.broadcast("newUpdate", "New timeslot deleted");
    res.status(200).end();
  } else {
    res.status(400).end();
  }
});

export default { router };
