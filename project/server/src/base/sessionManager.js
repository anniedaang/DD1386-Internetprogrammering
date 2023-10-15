import { v4 as uuidv4 } from "uuid";

class SessionManager {
  constructor() {
    this.sessions = new Map(); // sessionId as key, session as value
    this.usernames = new Map(); // sessionId as key, username as value
    this.clickhistory = new Map(); // sessionId as key, timestamp as value
    this.usersActiveSessions = new Map(); // username as key, number of active sessions as value
  }

  sessionExists(sessionId) {
    return this.sessions.has(sessionId);
  }

  findSessionById(sessionId) {
    return this.sessions.get(sessionId);
  }

  createNewSession(username) {
    const sessionId = uuidv4();
    this.sessions.set(sessionId, { id: sessionId });
    this.usernames.set(sessionId, username); // sessionId as key, username as value
    return this.findSessionById(sessionId);
  }

  getUsername(sessionId) {
    return this.usernames.get(sessionId);
  }

  usernameExists(sessionId) {
    return this.usernames.has(sessionId);
  }

  deleteSession(sessionId) {
    const username = this.getUsername(sessionId);
    this.decrementActiveSessions(username);
    this.sessions.delete(sessionId);
    this.usernames.delete(sessionId);
  }

  setClick(timestamp, sessionId) {
    this.clickhistory.set(sessionId, timestamp);
  }

  deleteAfterClick(timestamp, sessionId) {
    if (this.clickhistory.get(sessionId) === timestamp) {
      this.deleteSession(sessionId);
    }
  }

  // increments the number of active sessions for a user
  incrementActiveSessions(username) {
    if (this.usersActiveSessions.has(username)) {
      this.usersActiveSessions.set(
        username,
        this.usersActiveSessions.get(username) + 1
      );
    } else {
      this.usersActiveSessions.set(username, 1);
    }
  }

  // returns the number of active sessions for a user
  getActiveSessions(username) {
    return this.usersActiveSessions.get(username);
  }

  // decrement the number of active sessions for a user, if the user only has 1 active session then delete the user from the map
  decrementActiveSessions(username) {
    if (this.usersActiveSessions.get(username) === 1) {
      this.usersActiveSessions.delete(username);
    } else {
      this.usersActiveSessions.set(
        username,
        this.usersActiveSessions.get(username) - 1
      );
    }
  }
}

export default new SessionManager();
