<template>
  <div class="main-container">
    <div>
      <h2>All time slots</h2>
      <div
        v-for="(timeslot, index) in timeslots"
        :key="index"
        class="timeslot-button"
        :class="{ 'booked-slot': timeslot.booked }"
        @click="checkIfBooked(timeslot)"
        @keydown.enter="checkIfBooked(timeslot)"
      >
        <div class="group">
          <div class="label">Time:</div>
          <div class="value">{{ timeslot.time }}</div>
        </div>
        <div class="group">
          <div class="label">@</div>
          <div class="value">{{ timeslot.room }}</div>
        </div>
        <div v-if="timeslot.booked" class="small-text">
          <div class="label">Booked by:</div>
          <div class="value">{{ timeslot.bookingID }}</div>
        </div>
      </div>
    </div>
    <!-- Pop up window when a time is selected -->
    <div
      v-if="showBookingPopup"
      class="overlay"
      tabindex="0"
      @keydown.enter.prevent="submitBooking"
      @click.self="closeBookingPopup"
    >
      <div class="modal">
        <Booking :timeslot="selectedTimeSlot" @close="closeBookingPopup" />
      </div>
    </div>
    <div v-if="showMessage" class="message">{{ message }}</div>
  </div>
</template>

<script>
import Booking from "./Booking.vue";

export default {
  name: "ShowTimeSlots",
  components: {
    Booking,
  },

  data: () => ({
    timeslots: [],
    showBookingPopup: false,
    selectedTimeSlot: null,
    showMessage: false,
    message: "",
  }),

  created() {
    // fetching the created data that is available in storage
    const { getters } = this.$store;
    this.timeslots = getters.getTimeslots;
  },

  methods: {
    checkIfBooked(timeslot) {
      if (timeslot.booked) {
        // Displays message if room taken
        this.showMessage = true;
        this.message = `Time already taken by @${timeslot.bookingID}`;
      } else {
        this.selectedTimeSlot = timeslot;
        this.showBookingPopup = true;
      }
    },
    closeBookingPopup() {
      this.selectedTimeSlot = null;
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
  border: 3px solid white;
  background-color: rgb(255 255 255 / 78.7%);
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
  background-color: rgb(0 0 0 / 50%);
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
  background-color: rgb(255 255 255);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.booked-slot {
  background-color: rgb(255 0 0 / 54%);
}

.small-text {
  display: flex;
  justify-content: center;
  align-content: center;
  font-size: small;
}
</style>
