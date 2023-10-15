import { Router } from "express";
// npimport { Server } from "socket.io";
import db from "../base/db.js";
import model from "../model.js";
import SessionManager from "../base/sessionManager.js";

const router = Router();

// <<<<<<<<<<GET REQUESTS /showdocuments>>>>>>>>>>
router.get("/showdocuments", async (req, res) => {
  const allDocuments = model.getDocuments();
  res.status(200).json({ documents: allDocuments });
});

/* <<<<<<<<<<GET REQUESTS for a specific document>>>>>>>>>>
 * authenticates and returns the document if it is available
 */
router.get("/showdocuments/:id", async (req, res) => {
  const { id: documentID } = req.params; // Get the documents from the request parameters

  // Use a SQLite placeholder to defend against SQL injections, and query the documents table for the provided id
  const document = model.findDocumentByID(documentID);

  // appropriate HTTP response status code and send an HTTP response, if any, back to the client
  if (document) {
    res.status(200).json({ document });
  } else {
    res.status(400).end();
  }
});

router.get("/document/:id", async (req, res) => {
  const { id } = req.params; // Get the document id from the request parameters
  const document = model.findDocumentByID(id);
  if (document) {
    res.status(200).json({ document });
  } else {
    res.status(500).jsonp({ message: "Internal server error" });
  }
});

// <<<<<<<<<<GET REQUESTS for time out for a specific document>>>>>>>>>>
router.get("/close/:id", async (req, res) => {
  const { id } = req.params; // Get the documentID from the request parameters
  const document = model.findDocumentByID(id);
  model.broadcast("reservationTimeout", document);
  res.sendStatus(200);
});

// <<<<<<<<<<GET REQUESTS for finalized booking>>>>>>>>>>
router.get("/saved/:id", async (req, res) => {
  const { id } = req.params; // Get the document id from the request parameters
  const document = model.findDocumentByID(id);
  model.broadcast("newUpdate", document);
  model.broadcast("documentUpdated", document);
  res.sendStatus(200);
});

// <<<<<<<<<<POST REQUESTS NEW SAVE>>>>>>>>>>
// when the user is in the document and clicks save, this is called
router.post("/document/:id", async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const currentDocument = model.findDocumentByID(id);

  if (currentDocument.id) {
    currentDocument.setContent(content);
    model.updateDatabase(currentDocument, content);
    model.broadcast("newUpdate", currentDocument);
    res.status(200).end();
  } else {
    res.status(500).jsonp();
  }
});

router.put("/admin/createnewdocument", async (req, res) => {
  try {
    const { title } = req.body;
    const cookie = req.cookies["session-id"];
    const assistantName = SessionManager.getUsername(cookie);

    if (assistantName === undefined) {
      res.status(500).jsonp();
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
        model.createDocument(assistantName, title); // Create a new document in the model (also adds it to the database)
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

/* <<<<<<<<<<DELETE REQUESTS /admin/deletedocument/:id>>>>>>>>>>
 * delete a specific document
 */
router.delete("/admin/deletedocument/:id", async (req, res) => {
  const { id } = req.params; // Get the id from the request parameters
  const cookie = req.cookies["session-id"];
  const assistantName = SessionManager.getUsername(cookie);

  if (assistantName === undefined) {
    res.status(500).jsonp({ message: "user not authenticated" });
    return;
  }

  const document = model.findDocumentByID(id);
  const condition =
    document.assistantName === assistantName &&
    document.bookedBy !== "reserved";

  if (condition) {
    model.deleteDocument(id); // Delete the document from the model (also deletes it from the database
    model.broadcast("newUpdate", "New document deleted");
    res.status(200).end();
  } else {
    res.status(400).end();
  }
});

export default { router };
