<template>
  <div class="booking-form">
    <h2>Confirm the reservation</h2>
    <h5>{{ timeslot.time }} @{{ timeslot.room }}</h5>
    <div v-show="showTimer" class="countdown-timer">
      {{ countdown }}
    </div>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="name">Name</label>
        <input
          id="name"
          v-model="name"
          type="text"
          required
          minlength="3"
          maxlength="24"
          placeholder="enter your name..."
        />
        <p class="error-message">
          use at least 3 characters, but no more than 24
        </p>
      </div>
      <div class="form-group">
        <button ref="bookingButton" type="submit" :disabled="bookingDisabled">
          Book
        </button>
        <button type="button" class="cancel-booking-btn" @click="close">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: "BookingView",
  props: {
    timeslot: {
      type: Object,
      required: true,
    },
  },
  emits: ["close"],
  data: () => ({
    name: "",
    bookingDisabled: false,
    showTimer: false,
    countdown: 10,
    timerId: null,
  }),
  mounted() {
    // wait until the component is fully rendered before setting focus and starting the timer
    this.$nextTick(() => {
      this.$refs.bookingButton.focus(); // set focus on the booking button
      this.startTimer(); // start the countdown timer
    });
  },
  methods: {
    submitForm() {
      const { commit } = this.$store;
      const updatedTimeslot = {
        ...this.timeslot,
        booked: true,
        bookingID: this.name,
        redirect: false,
      };
      commit("updateTimeSlot", updatedTimeslot);
      this.$emit("close");
    },
    close() {
      this.resetTimer();
      this.$emit("close");
    },
    startTimer() {
      this.showTimer = true; // start an interval timer that executes every 1000 milliseconds (1 second)
      this.timerId = setInterval(() => {
        if (this.countdown > 0) {
          // decrement the countdown timer by 1 second
          this.countdown -= 1;
        } else {
          // if the countdown reaches 0, reset the timer and close the dialog
          this.resetTimer();
          this.close();
        }
      }, 1000);
    },
    resetTimer() {
      // clear the interval timer
      clearInterval(this.timerId);
      // reset the state of the timer and booking button
      this.bookingDisabled = false;
      this.showTimer = false;
      this.countdown = 10; // reset the countdown timer to its initial value
    },
  },
};
</script>

<style scoped>
.booking-form {
  margin: 0 auto;
  max-width: 500px;
  text-align: center;
}

.form-group {
  margin: 10px 0;
  justify-content: center;
}

label {
  font-weight: bold;
}

input {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

button {
  margin-right: 10px;
  padding: 5px 10px;
  background-color: #68a03c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background-color: #3c743a;
}

.countdown-timer {
  font-size: 40px;
  font-family: monospace;
  margin-top: 10px;
  color: red;
  font-weight: bold;
}

.cancel-booking-btn {
  background-color: #f00;
}

.error-message {
  color: #8b0000;
  font-size: small;
}
</style>
