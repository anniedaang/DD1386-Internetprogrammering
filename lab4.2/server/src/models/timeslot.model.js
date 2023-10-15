class Timeslot {
  constructor(id, assistantName, title, content) {
    this.id = id;
    this.assistantName = assistantName;
    this.title = title;
    this.content = content;
  }

  getTimeslotID() {
    return this.id;
  }

  getAssistantName() {
    return this.assistantName;
  }

  getTitle() {
    return this.title;
  }

  getContent() {
    return this.content;
  }

  setContent(content) {
    this.content = content;
  }

  setTitle(title) {
    this.title = title;
  }
  
}
export default Timeslot;
