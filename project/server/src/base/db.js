import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { resolvePath } from "../util.js";

sqlite3.verbose();

// Open and initialize the database
const db = await open({
  filename: resolvePath("db.sqlite"),
  driver: sqlite3.Database,
});

// Create the "Assistants" table if it does not already exist
await db.run("DROP TABLE IF EXISTS Assistants");
await db.run(`CREATE TABLE Assistants (
    assistantID TEXT NO NULL,
    username TEXT NO NULL,
    password TEXT NO NULL
);
`);

// Add some initial data to the "Assistants" table for testing purposes
const statement = await db.prepare("INSERT INTO Assistants VALUES (?, ?, ?)");
await statement.run("00001", "assistant1", "pass1");
await statement.run("00002", "assistant2", "pass2");
await statement.run("00003", "assistant3", "pass3");
statement.finalize();

// console log the contents of the Assistants table
console.log("Assistants table created");
await db.each("SELECT * FROM Assistants", (err, row) => {
  if (err) {
    throw new Error(err);
  }
  console.log(row);
});

// Create the "Timeslots" table if it does not already exist
await db.run("DROP TABLE IF EXISTS Documents");
await db.run(`
CREATE TABLE Documents (
    id TEXT NO NULL,
    assistantName TEXT NO NULL,
    title TEXT NO NULL,
    content TEXT
);
`);

// Add some initial data to the "Timeslots" table for testing purposes
const insertDoc = await db.prepare("INSERT INTO Documents VALUES (?, ?, ?, ?)");
await insertDoc.run(
  "20000001",
  "assistant1",
  "Test Document 1",
  "This is a test document"
);
await insertDoc.run(
  "20000002",
  "assistant1",
  "Test Document 2",
  "This is a test document"
);
await insertDoc.run(
  "20000003",
  "assistant2",
  "Test Document 3",
  "This is a test document"
);
await insertDoc.run(
  "20000004",
  "assistant2",
  "Test Document 4",
  "This is a test document"
);
await insertDoc.run(
  "20000005",
  "assistant3",
  "Test Document 5",
  "This is a test document"
);
await insertDoc.run(
  "20000006",
  "assistant3",
  "Test Document 6",
  "This is a test document"
);
insertDoc.finalize();

// console log the contents of the Timeslots table
console.log("\nDocuments table created");
await db.each("SELECT * FROM Documents", (err, row) => {
  if (err) {
    throw new Error(err);
  }
  console.log(row);
});

export default db;
