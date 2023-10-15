<template>
  <div class="booking-form">
    <h2>{{ document.title }}</h2>
    <h5>Created by: {{ document.assistantName }}</h5>
    <div class="form-group">
      <label for="content"></label>
      <textarea
        id="content"
        v-model="document.content"
        required
        placeholder="enter document content..."
      ></textarea>
    </div>
    <div class="form-group">
      <button ref="bookingButton" type="submit" :disabled="bookingDisabled" @click="submitForm">
        Save
      </button>
      <button type="button" class="cancel-booking-btn" @click="close">
        Cancel
      </button>
    </div>
    <div class="message-box" v-if="message">{{ message }}</div>
  </div>
</template>

<script>
export default {
  name: "BookingView",
  props: {
    document: {
      type: Object,
      required: true,
    },
  },
  emits: ["close"],
  data: () => ({
    bookingDisabled: false,
    currentDocument: null,
    message: "",
  }),
  created() {
    // fetch the current state of the document from the server
    fetch(`/api/document/${this.document.id}`)
      .then((res) => res.json())
      .then(({ document }) => {
        this.currentDocument = document;
        console.log(this.currentDocument);
      })
      .catch(console.error);
  },

  mounted() {
    // wait until the component is fully rendered before setting focus and starting the timer
    this.$nextTick(() => {
      this.$refs.bookingButton.focus(); // set focus on the booking button
    });
  },

  methods: {
    submitForm() {
      fetch(`/api/document/${this.document.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: this.document.content,
        }),
      })
        .then((response) => {
          if (response.ok) {
            this.saved(); // Set message to indicate successful save
            return response.json();
          } else {
            throw new Error("Failed to save document.");
          }
        })
        .catch((error) => {
          console.error("Error saving document:", error);
          this.message = "Failed to save"; // Set message to indicate save failure
          this.hideMessageAfterDelay(2000); // Hide message after 2 seconds
        });
    },

    saved() {
      fetch(`/api/saved/${this.document.id}`)
        .then((res) => {
          if (res.ok) {
            this.message = "Saved"; // Set message to indicate successful save
          } else {
            this.message = "Failed to save"; // Set message to indicate save failure
          }
        })
        .catch(console.error);

      this.hideMessageAfterDelay(2000); // Hide message after 2 seconds
    },

    hideMessageAfterDelay(delay) {
      setTimeout(() => {
        this.message = ""; // Clear the message after the specified delay
      }, delay);
    },

    close() {
      fetch(`/api/close/${this.document.id}`)
        .then((res) => {
          if (res.ok) {
            console.log("Going back");
          } else {
            console.error("Failed to set reservation timeout");
          }
        })
        .catch(console.error);
      this.$emit("close");
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

.error-message {
  color: #8b0000;
  font-size: small;
}

.cancel-booking-btn {
  background-color: #f00;
}
</style>
