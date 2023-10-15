import { v4 as uuidv4 } from "uuid";
import Assistant from "./models/assistant.model.js";
import Timeslot from "./models/timeslot.model.js";
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
  async createTimeslot(assistant, title) {
    const randomID = uuidv4(); // Generate a unique ID
    this.documents[randomID] = new Timeslot(randomID, assistant, title, "");

    // insert into database
    await db.run(
      "INSERT INTO Documents (id, assistantName, title, content) VALUES (?, ?, ?, ?)",
      [randomID, assistant, title, ""]
    );
    this.currentAssistant = assistant;
    return randomID;
  }

  async resetTimeslots() {
    this.documents = {};
    await this.allTimeslots();
  }

  async updateDatabase(document, content) {
    const id = document.getTimeslotID();
    const statement = await db.prepare(
      "UPDATE Documents SET content = ? WHERE id = ?"
    );
    await statement.run([content, id]);
    console.log("UPDATED DATABASE");
  }

  async deleteTimeslot(id) {
    const document = this.documents[id];
    const statement = await db.prepare(
      "DELETE FROM Documents WHERE assistantName = ? AND title = ?"
    );
    await statement.run([document.getAssistantName, document.getTitle]);
    delete this.documents[id];
  }

  findTimeslotByID(id) {
    return this.documents[id];
  }

  getTimeslots() {
    const timeslotsArray = Object.values(this.documents);
    return timeslotsArray;
  }

  getAssistants() {
    return Array.from(this.assistants.entries());
  }

  createAssistant(id, name) {
    const assistant = new Assistant(id, name);
    this.assistants.set(id, assistant); // Use the id as the key in the Map
  }

  findAssistantByUsername(username) {
    for (const assistant of this.assistants.values()) {
      if (assistant.getUsername() === username) {
        return assistant;
      }
    }
    return null;
  }

  findAssistantByID(id) {
    return this.assistants.get(id);
  }

  // THIS ONE NEEDS TO BE CHANGED
  getTimesForAssistant(assistant) {
    const documents = [];
    for (const doc of Object.values(this.documents)) {
      if (doc.getAssistantName() === assistant) {
        documents.push(doc);
      }
    }
    return documents;
  }

  async allAssistants() {
    const rows = await db.all("SELECT * FROM Assistants");
    for (const row of rows) {
      this.assistants.set(
        row.assistantID,
        new Assistant(row.assistantID, row.username)
      );
    }
  }

  // reads the timeslots from the database and puts them in the timeslots object
  async allTimeslots() {
    await db.each("SELECT * FROM Documents ORDER BY title", [], (err, row) => {
      if (err) {
        throw new Error(err);
      } else {
          this.documents[row.id] = new Timeslot(
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
