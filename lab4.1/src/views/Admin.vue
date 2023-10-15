<template>
  <div class="admin-container">
    <div class="text-center">
      <h1>Signed in as @{{ admin }}</h1>
      <br />
      <h5>Add a new timeslot</h5>
      <!-- Time code -->
      <form @submit.prevent="addTimeSlot()">
        <div class="input-container">
          <label for="hour">Hour:</label>
          <select
            id="hour"
            v-model="newAddedTimeslot.hour"
            class="form-control"
          >
            <option
              v-for="h in 24"
              :key="h"
              :value="h.toString().padStart(2, '0')"
            >
              {{ h.toString().padStart(2, "0") }}
            </option>
          </select>
          <label for="minute">Minute:</label>
          <select
            id="minute"
            v-model="newAddedTimeslot.minute"
            class="form-control"
          >
            <option
              v-for="m in 60"
              :key="m"
              :value="m.toString().padStart(2, '0')"
            >
              {{ m.toString().padStart(2, "0") }}
            </option>
          </select>
          <button type="submit" class="btn btn-primary">Add</button>
        </div>
      </form>
    </div>
    <!-- Displays all the added time slots from the array -->
    <br />
    <h5>Added Time Slots</h5>
    <div class="time-slots-container">
      <div
        v-for="timeslot in filteredTimeslots"
        :key="timeslot.time"
        class="time-slot-row"
      >
        <div class="time-slot">
          <div class="time-slot-info">
            <span class="time-slot-label">Time:</span>
            <span class="time-slot-value">{{ timeslot.time }}</span>
          </div>
          <div class="time-slot-info">
            <span class="time-slot-label">@{{ timeslot.room }}</span>
          </div>
          <p></p>
          <label :for="'timeslot-' + timeslot.id">{{ timeslot.label }}</label>
          <input
            :id="'timeslot-' + timeslot.id"
            v-model="timeslot.checked"
            type="checkbox"
          />
          <div v-if="timeslot.booked">
            <div class="time-slot-info">
              Booked by: {{ timeslot.bookingID }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <button type="button" class="btn btn-danger" @click="deleteTimeSlot()">
      Remove
    </button>
  </div>
</template>

<script>
export default {
  name: "AdminView",
  data: () => ({
    admin: "",
    timeslots: [],
    newAddedTimeslot: { room: "", hour: "", minute: "" },
  }),
  computed: {
    filteredTimeslots() {
      return this.timeslots.filter(
        (timeslot) =>
          timeslot.room === this.admin || timeslot.room === "default"
      );
    },
  },
  created() {
    // fetching the created data that is available in storage
    const { getters } = this.$store;
    this.admin = getters.getUsername;
    this.timeslots = getters.getTimeslots;
  },
  methods: {
    addTimeSlot() {
      // adding new timeslot and sorting it
      const time = `${this.newAddedTimeslot.hour}:${this.newAddedTimeslot.minute}`; // creates a time variable by concatenating the hour and minute
      this.timeslots.push({
        room: this.admin,
        time,
        checked: false,
        booked: false,
        bookingID: "",
        redirect: false,
      });
      this.$store.commit("setTimeSlots", this.timeslots);
      this.$store.commit("sortTimeSlots");
      this.newAddedTimeslots = { room: "", hour: "", minute: "" };
    },
    deleteTimeSlot() {
      const filteredTimeslots = this.timeslots.filter(
        (timeslot) => !timeslot.checked
      );
      this.$store.commit("setTimeSlots", filteredTimeslots);
      this.timeslots = filteredTimeslots;
    },
    logOut() {
      this.$store.commit("clearAuth");
      this.$store.commit("clearUsername");
      this.$router.push("/");
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
</style>
