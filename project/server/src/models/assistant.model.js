class Assistant {
  constructor(id, username) {
    this.id = id;
    this.username = username;
    this.socket = null;
    this.cookie = false;
    this.authenticated = false;
  }
  // här kommer eventuella getters, setters elle andra "nödvändiga" metoder

  getUsername() {
    return this.username;
  }

  getID() {
    return this.id;
  }

  setSocket(socket) {
    this.socket = socket;
  }

  setAuthenticated(cookie) {
    this.authenticated = true;
    this.cookie = cookie;
  }

  unAuthenticate() {
    this.authenticated = false;
    this.cookie = false;
  }
}
export default Assistant;
