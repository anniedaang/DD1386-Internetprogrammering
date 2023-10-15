<template>
  <div class="admin-container">
    <div class="text-center">
      <h1>Signed in as @{{ admin }}</h1>
      <br />
      <h5>Add a new document</h5>
      <div class="form-group">
        <input type="text" v-model="newDocumentTitle" placeholder="Enter document title" />
        <button type="button" @click="createNewDocument">Create</button>
      </div>
    </div>
    <!-- Displays all the added time slots from the array -->
    <br />
    <h5>All Documents</h5>
    <div class="time-slots-container">
      <div
        v-for="document in documents"
        :key="document.time"
        class="time-slot-row"
      >
        <div class="time-slot">
          <div class="time-slot-info">
            <span class="time-slot-label">Title: </span>
            <span class="time-slot-value">{{ document.title }}</span>
          </div>
          <div class="time-slot-info">
            <span class="time-slot-label">Created by: </span>
            <span class="time-slot-value">{{ document.assistantName }}</span>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-danger"
            @click="deleteTimeSlot(document.id)"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";
import activityMixin from "./activityMixin";

export default {
  name: "AdminView",
  mixins: [activityMixin],
  data: () => ({
    admin: "",
    documents: [],
    newDocumentTitle: "",
    socket: io(),
  }),
  created() {
    fetch("/api/admin")
      .then((res) => res.json())
      .then(({ username, timeslots: documents }) => {
        this.admin = username;
        this.documents = documents;
      })
      .catch(console.error);

    // listen to new updates
    this.socket.on("newUpdate", () => {
      this.fetchTimeslots();
    });

    this.socket.on("reserved", (timeslot) => {
      // Find the timeslot object with the same timeslotID as the reserved timeslot
      const index = this.documents.findIndex(
        (t) => t.timeslotID === timeslot.timeslotID
      );
      if (index !== -1) {
        // if the timeslot object was found
        // Update the timeslot object to set booked and bookedBy properties
        this.documents[index].booked = true;
        this.documents[index].bookedBy = timeslot.bookedBy;
      }
    });

    this.socket.on("reservationTimeout", (timeslot) => {
      // Find the timeslot object with the same timeslotID as the reserved timeslot
      const index = this.documents.findIndex(
        (t) => t.timeslotID === timeslot.timeslotID
      );
      if (index !== -1) {
        // if the timeslot object was found
        // Update the timeslot object to set booked and bookedBy properties
        this.documents[index].booked = false;
        this.documents[index].bookedBy = "null";
      }
    });

    this.socket.on("timeslotbooked", (timeslot) => {
      // Find the timeslot object with the same timeslotID as the reserved timeslot
      const index = this.documents.findIndex(
        (t) => t.timeslotID === timeslot.timeslotID
      );
      if (index !== -1) {
        // if the timeslot object was found
        // Update the timeslot object to set booked and bookedBy properties
        this.documents[index].booked = true;
        this.documents[index].bookedBy = timeslot.bookedBy;
      }
    });
  },
  mounted() {
    this.fetchTimeslots();
  },
  methods: {
    async createNewDocument() {
      if (this.newDocumentTitle) {
        // Create a new document with the entered title
        const response = fetch("/api/admin/createnewdocument", {
          method: "PUT",
          body: JSON.stringify({ title: this.newDocumentTitle }),
          headers: { "Content-Type": "application/json" },
        });

        if (response.status === 200) {
          // Upon successful creation, add the new document to the documents array
          const data = await response.json();
          const newDocument = data.document;
          this.documents.push(newDocument);
        } else {
          throw new Error("Something went wrong");
        }
      };
        // Clear the input field after creating the document
        this.newDocumentTitle = "";
    },


    async deleteTimeSlot(id) {
      const response = await fetch(`/api/admin/deletetimeslot/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        this.timeslots = this.documents.filter(
          (timeslot) => timeslot.timeslotID !== id
        );
      } else {
        throw new Error("Something went wrong");
      }
    },

    async fetchTimeslots() {
      try {
        const response = await fetch("/api/admin");
        const data = await response.json();
        this.admin = data.username;
        this.documents = data.timeslots;
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

<style>
.admin-container {
  margin: 0 auto;
  max-width: 800px;
  text-align: center;
}

.input-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
}

.input-container > * {
  margin: 0 10px;
}

.input-container > select {
  width: 80px; /* reduce the width of the select element */
}

.time-slots-container {
  margin-top: 20px;
  text-align: center;
}

.time-slot-row {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
}

.time-slot {
  background-color: #eee;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  width: 300px;
  display: flex;
  flex-direction: column;
}

.time-slot-info {
  display: flex;
}

.time-slot-label {
  font-weight: bold;
}

.time-slot-value {
  margin-left: 5px;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
}
</style>
