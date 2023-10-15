<template>
  <div class="admin-container">
    <div class="text-center">
      <h1>Signed in as @{{ admin }}</h1>
      <br />
      <h5>Add a new document</h5>
      <div class="form-group">
        <label for="documentTitle">Document Title:</label>
        <input
          v-model="newDocumentTitle"
          type="text"
          placeholder="Enter document title"
        />
        <button type="button" @click="createNewDocument">Create</button>
      </div>
    </div>
    <!-- Displays all the added documents from the array -->
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
            @click="deleteDocument(document.id)"
          >
            Remove
          </button>
          <button
            type="button"
            class="btn btn-sm btn-primary"
            @click="edit(document)"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";

export default {
  name: "AdminView",
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
      this.fetchDocuments();
    });
  },
  mounted() {
    this.fetchDocuments();
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
      }
      // Clear the input field after creating the document
      this.newDocumentTitle = "";
    },

    async deleteDocument(id) {
      const response = await fetch(`/api/admin/deletedocument/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        this.documents = this.documents.filter(
          (document) => document.id !== id
        );
      } else {
        throw new Error("Something went wrong");
      }
    },

    async edit(document) {
      await fetch(`/api/showdocuments/${document.id}`) // send a GET request to the server for the document with the given id
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

    async fetchDocuments() {
      try {
        const response = await fetch("/api/admin");
        const data = await response.json();
        this.admin = data.username;
        this.documents = data.documents;
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
