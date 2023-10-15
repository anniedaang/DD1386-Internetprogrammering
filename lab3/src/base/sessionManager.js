import { v4 as uuidv4 } from "uuid";

class SessionManager {
  constructor() {
    this.sessions = new Map(); // cookie as key, session as value
    this.usernames = new Map(); // cookie as key, username as value
    this.clickhistory = new Map(); // cookie as key, timestamp as value
    this.usersActiveSessions = new Map(); // username as key, number of active sessions as value
  }

  sessionExists(id) {
    return this.sessions.has(id);
  }

  findSessionById(id) {
    return this.sessions.get(id);
  }

  createNewSession(username) {
    const id = uuidv4();
    this.sessions.set(id, { id });
    const cookie = this.findSessionById(id);
    console.log(`this is cookie.id: ${cookie.id}`);
    this.usernames.set(cookie.id, username); // cookie as key, username as value
    return cookie;
  }

  getUsername(cookie) {
    return this.usernames.get(cookie);
  }

  usernameExists(cookie) {
    return this.usernames.has(cookie);
  }

  deleteSession(cookie) {
    this.decrementActiveSessions(this.getUsername(cookie));
    this.sessions.delete(cookie);
    this.usernames.delete(cookie);
  }

  setClick(timeStamp, cookie) {
    this.clickhistory.set(cookie, timeStamp);
  }

  deleteAfterClick(timeStamp, cookie) {
    if (this.clickhistory.get(cookie) === timeStamp) {
      this.deleteSession(cookie);
    }
  }

  // increments the number of active sessions for a user
  activeSessionsTracker(username) {
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
