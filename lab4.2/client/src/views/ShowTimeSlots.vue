<template>
  <div class="main-container">
    <div>
      <h2>All Documents</h2>
      <!-- Display all the timeslots -->
      <div
        v-for="(timeslot, index) in documents"
        :key="index"
        class="timeslot-button"
        :class="{ 'booked-slot': timeslot.booked }"
        :disabled="timeslot.booked"
        tabindex="0"
        :aria-label="
          timeslot.booked
            ? `This timeslot is already booked by ${timeslot.bookedBy}`
            : `Select timeslot at ${timeslot.time}`
        "
        @click="authenticate(timeslot)"
        @keydown.enter="authenticate(timeslot)"
      >
        <div class="group">
          <div class="label">Title:</div>
          <div class="value">{{ timeslot.title }}</div>
        </div>
        <div class="group">
          <div class="label">Creator: </div>
          <div class="value">{{ timeslot.assistantName }}</div>
        </div>
        <div v-if="timeslot.booked" class="small-text">
          <div class="label">Editing</div>
        </div>
      </div>
    </div>
    <!-- Pop up window when a time is selected -->
    <div v-if="showBookingPopup" class="overlay">
      <div class="modal">
        <Booking :document="selectedDocument" @close="closeBookingPopup" />
      </div>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";
import Booking from "./Booking.vue";

export default {
  name: "ShowTimeSlots",
  components: {
    Booking,
  },
  data: () => ({
    message: "",
    documents: [],
    showBookingPopup: false,
    selectedDocument: null,
    socket: io().connect(),
  }),

  created() {
    // Fetch all the timeslots from the server
    fetch("/api/showtimeslots")
      .then((res) => res.json())
      .then(({ timeslots }) => {
        this.documents = timeslots;
        console.log(this.documents); // log the timeslots
      })
      .catch(console.error);

    // Listen for updates through socket
    this.socket.on("newUpdate", () => {
      fetch("/api/showtimeslots")
        .then((res) => res.json())
        .then(({ timeslots }) => {
          this.documents = timeslots;
        })
        .catch(console.error);
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

  methods: {
    async authenticate(timeslot) {
      // Check if the timeslot is already booked
      await fetch(`/api/showtimeslots/${timeslot.id}`) // send a GET request to the server for the timeslot with the given timeslotID
        .then(async (res) => {
          // if the request succeeds
          const documentData = await res.json();
          const documentObj = documentData.timeslot;
          if (!documentObj) {
            console.log("Timeslot not found");
          } else {
            this.selectedDocument = documentObj; // if the timeslot is not booked, set the selected timeslot to the timeslot that was clicked
            this.showBookingPopup = true; // show the booking popup
          }
        })
        .catch(console.error); // if there's an error with the request, log it to the console
    },

    closeBookingPopup() {
      this.selectedDocument = null;
      this.showBookingPopup = false;
    },
  },
};
</script>

<style scoped>
.main-container {
  margin: 0 auto;
  max-width: 800px;
  text-align: center;
}

.timeslot-button {
  display: inline-block;
  margin: 2px;
  padding: 10px;
  border: 3px solid #fff;
  background-color: #ffffffc9;
  width: 500px;
  height: fit-content;
  text-align: center;
}

.timeslot-button:hover {
  background-color: #be9595a2;
}

.group {
  display: flex;
  justify-content: center;
  align-content: center;
}

.label {
  display: flex;
  font-weight: bold;
}

.value {
  display: flex;
  font-weight: normal;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  width: 100%;
  height: 100%;
  background-color: #00000080;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

/* Styles for the modal */
.modal {
  position: relative;
  top: 0;
  left: 0;
  z-index: 999;
  width: 40%;
  height: 40%;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.booked-slot {
  background-color: #ff00008a;
}

.small-text {
  display: flex;
  justify-content: center;
  align-content: center;
  font-size: small;
}
</style>
