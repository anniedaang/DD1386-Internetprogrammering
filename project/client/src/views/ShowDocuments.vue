<template>
  <div class="main-container">
    <div>
      <h2>All Documents</h2>
      <!-- Display all the documents -->
      <div
        v-for="(document, index) in documents"
        :key="index"
        class="timeslot-button"
        :class="{ 'booked-slot': document.booked }"
        :disabled="document.booked"
        tabindex="0"
        :aria-label="
          document.booked
            ? `This timeslot is already booked by ${document.bookedBy}`
            : `Select timeslot at ${document.time}`
        "
        @click="authenticate(document)"
        @keydown.enter="authenticate(document)"
      >
        <div class="group">
          <div class="label">Title:</div>
          <div class="value">{{ document.title }}</div>
        </div>
        <div class="group">
          <div class="label">Creator:</div>
          <div class="value">{{ document.assistantName }}</div>
        </div>
        <div v-if="document.booked" class="small-text">
          <div class="label">Editing</div>
        </div>
      </div>
    </div>
    <!-- Pop up window when a document is selected -->
    <div v-if="showBookingPopup" class="overlay">
      <div class="modal">
        <Booking :document="selectedDocument" @close="closeBookingPopup" />
      </div>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";

export default {
  name: "ShowDocuments",
  data: () => ({
    message: "",
    documents: [],
    showBookingPopup: false,
    selectedDocument: null,
    socket: io().connect(),
  }),
  created() {
    // Fetch all the documents from the server
    fetch("/api/showdocuments")
      .then((res) => res.json())
      .then(({ documents }) => {
        this.documents = documents;
        console.log(this.documents); // log the documents
      })
      .catch(console.error);
  },
  methods: {
    async authenticate(document) {
      await fetch(`/api/showdocuments/${document.id}`) // send a GET request to the server for the timeslot with the given timeslotID
        .then(async (res) => {
          // if the request succeeds
          const documentData = await res.json();
          const documentObj = documentData.document;
          if (!documentObj) {
            console.log("Document not found");
          } else {
            this.$router.push(`/booking/${document.id}`);
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
