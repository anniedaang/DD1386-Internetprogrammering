import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import Assistant from "./models/assistant.model.js";
import Document from "./models/document.model.js";
import db from "./base/db.js";

class Model {
  constructor() {
    this.documents = {};
    this.assistants = new Map();

    this.io = undefined;
    this.currentAssistant = undefined;
  }

  init(io, server) {
    this.io = io;
    this.server = server;
  }

  // takes in assistant and title --> creates a new document and put it in the database and returns the document id created
  async createDocument(assistant, title) {
    const randomID = uuidv4(); // Generate a unique ID
    this.documents[randomID] = new Document(randomID, assistant, title, "");

    // insert into database
    await db.run(
      "INSERT INTO Documents (id, assistantName, title, content) VALUES (?, ?, ?, ?)",
      [randomID, assistant, title, ""]
    );
    this.currentAssistant = assistant;
    return randomID;
  }

  async resetDocuments() {
    this.documents = {};
    await this.allDocuments();
  }

  async updateDatabase(document, content) {
    const id = document.getID();

    const statement = await db.prepare(
      "UPDATE Documents SET content = ? WHERE id = ?"
    );
    await statement.run([content, id]);
    console.log(this.currentAssistant);
  }

  async deleteDocument(id) {
    const document = this.documents[id];
    const statement = await db.prepare(
      "DELETE FROM Documents WHERE assistantName = ? AND title = ?"
    );
    await statement.run([document.getAssistantName, document.getTitle]);
    delete this.documents[id];
  }

  findDocumentByID(id) {
    return this.documents[id];
  }

  getDocuments() {
    const documentsArray = Object.values(this.documents);
    return documentsArray;
  }

  getAssistants() {
    return Array.from(this.assistants.entries());
  }

  async createAssistant(username, password) {
    const id = uuidv4();
    const assistant = new Assistant(id, username);
    this.assistants.set(id, assistant); // Use the id as the key in the Map

    // hash and salt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const statement = await db.prepare(
      "INSERT INTO Assistants (assistantID, username, password) VALUES (?, ?, ?)"
    );
    await statement.run([id, username, hashedPassword]);
    return assistant;
  }

  async logIn(username, password) {
    const assistant = this.findAssistantByUsername(username);
    if (assistant) {
      // Use a SQLite placeholder to defend against SQL injections, and query the Assistants table for the provided username
      const statement = await db.prepare(
        "SELECT * FROM Assistants WHERE username = ?"
      );
      const result = await statement.get([username]);
      if (result) {
        // Compare the provided password with the hashed password from the database
        const match = await bcrypt.compare(password, result.password);
        if (match) {
          return assistant;
        }
      }
    }
    return null;
  }

  findAssistantByUsername(username) {
    return (
      Array.from(this.assistants.values()).find(
        (assistant) => assistant.getUsername() === username
      ) || null
    );
  }

  findAssistantByID(id) {
    return this.assistants.get(id);
  }

  getDocumentsForAssistant(assistant) {
    return Object.values(this.documents).filter(
      (doc) => doc.getAssistantName() === assistant
    );
  }

  async allAssistants() {
    const rows = await db.all("SELECT * FROM Assistants");
    rows.forEach((row) => {
      this.assistants.set(
        row.assistantID,
        new Assistant(row.assistantID, row.username)
      );
    });
  }

  // reads the documents from the database and puts them in the documents object
  async allDocuments() {
    await db.each("SELECT * FROM Documents ORDER BY title", [], (err, row) => {
      if (err) {
        throw new Error(err);
      } else {
        this.documents[row.id] = new Document(
          row.id,
          row.assistantName,
          row.title,
          row.content
        );
      }
    });
    console.log(this.documents);
  }

  broadcast(typeOfMessage, message) {
    this.io.emit(typeOfMessage, message);
  }
}

export default new Model();
