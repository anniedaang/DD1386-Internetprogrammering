<template>
  <div class="document-page">
    <h2>{{ document.title }}</h2>
    <h5>Created by: {{ document.assistantName }}</h5>
    <div class="form-group">
      <label for="content"></label>
      <textarea
        id="content"
        v-model="document.content"
        required
        placeholder="Enter document content..."
      ></textarea>
    </div>
    <div class="form-group">
      <button type="submit" :disabled="bookingDisabled" @click="submitForm">
        Save
      </button>
      <router-link to="/showdocuments" class="cancel-booking-btn"
        >Cancel</router-link
      >
    </div>
    <div v-if="message" class="message-box">{{ message }}</div>
  </div>
</template>

<script>
import io from "socket.io-client";

export default {
  name: "BookingView",
  data: () => ({
    bookingDisabled: false,
    document: null,
    message: "",
    socket: io(),
  }),
  created() {
    const documentId = this.$route.params.id; // Retrieve the document ID from the route parameter
    this.fetchDocument(documentId); // Fetch the initial document data based on the ID

    this.socket.on("newUpdate", (updatedDocument) => {
      if (updatedDocument.id === this.document.id) {
        // Check if the updated document ID matches the current document ID
        this.document.content = updatedDocument.content; // Update the content with the new data
        this.message = "Document updated"; // Show a message indicating that the document has been updated
        this.hideMessageAfterDelay(2000); // Hide the message after a delay
      }
    });
  },
  methods: {
    fetchDocument(documentId) {
      // Fetch the document data from the server based on the ID
      fetch(`/api/document/${documentId}`)
        .then((res) => res.json())
        .then(({ document }) => {
          this.document = document;
        })
        .catch(console.error);
    },

    submitForm() {
      // Submit the form and save the document data
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
            this.saved();
            return response.json();
          }
          throw new Error("Failed to save document.");
        })
        .catch((error) => {
          console.error("Error saving document:", error);
          this.message = "Failed to save";
          this.hideMessageAfterDelay(2000);
        });
    },
    saved() {
      // Perform actions after the document is saved successfully
      fetch(`/api/saved/${this.document.id}`)
        .then((res) => {
          if (res.ok) {
            this.message = "Saved";
          } else {
            this.message = "Failed to save";
          }
        })
        .catch(console.error);

      this.hideMessageAfterDelay(2000);
    },
    hideMessageAfterDelay(delay) {
      setTimeout(() => {
        this.message = "";
      }, delay);
    },
  },
};
</script>

<style scoped>
.document-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f2f2f2;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
  border-radius: 8px;
}

.document-page h2 {
  margin-top: 0;
}

.document-page h5 {
  margin-bottom: 20px;
}

.document-page .form-group {
  margin-bottom: 20px;
}

.document-page label {
  display: block;
  margin-bottom: 8px;
}

.document-page textarea {
  width: 100%;
  height: 300px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: none;
}

.document-page button {
  padding: 8px 16px;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
}

.document-page button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.document-page .cancel-booking-btn {
  background-color: #dc3545;
  margin-left: 10px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  color: #fff;
  text-decoration: none;
}

.document-page .message-box {
  margin-top: 10px;
  padding: 8px;
  border-radius: 4px;
  color: #000;
}

.document-page .message-box.success {
  background-color: #28a745;
}

.document-page .message-box.error {
  background-color: #dc3545;
}
</style>
