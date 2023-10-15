<template>
  <div id="app">
    <header>
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
          <h1>Document Editing</h1>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div id="navbarNavDropdown" class="collapse navbar-collapse">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <!-- Admin button -->
              <li class="nav-item dropdown">
                <a
                  id="navbarDropdown"
                  class="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  >Admin</a
                >
                <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                  <li v-if="authenticated">
                    <router-link class="dropdown-item" :to="{ path: '/admin' }"
                      >{{ "Profile" }}
                    </router-link>
                  </li>
                  <li v-if="authenticated">
                    <a class="dropdown-item" href="#" @click.prevent="logout()"
                      >Log Out</a
                    >
                  </li>
                  <li v-if="!authenticated">
                    <router-link
                      class="dropdown-item"
                      :to="{ path: '/login' }"
                      >{{ "Log in" }}</router-link
                    >
                  </li>
                  <li v-if="!authenticated">
                    <router-link
                      class="dropdown-item"
                      :to="{ path: '/register' }"
                      >{{ "Register" }}</router-link
                    >
                  </li>
                </ul>
              </li>
              <!-- All Documents -->
              <li class="nav-item">
                <router-link
                  class="nav-link"
                  :to="authenticated ? '/showdocuments' : ''"
                  :disabled="!authenticated"
                  >All Documents
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  </div>
  <section class="container-fluid py-4">
    <router-view @log-in="signedIn = true" />
  </section>
</template>

<script>
// @ is an alias to /src
import "bootstrap";
import io from "socket.io-client";

const IDLE_TIME = 30000; // 30 seconds

export default {
  name: "App",
  components: {},
  data: () => ({
    username: "",
    state: 0,
    signedIn: false,
  }),
  computed: {
    authenticated() {
      return this.$store.getters.isAuthenticated;
    },
  },
  created() {
    // Establish the socket.io connection
    const socket = io();

    // Start a timer for the user's inactivity
    let inactivityTimer;

    // Function to reset the inactivity timer
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer); // Clear the previous timer
      inactivityTimer = setTimeout(() => {
        // Emit an "activity" event to the server to reset the timer
        socket.emit("activity");
      }, IDLE_TIME);
    };

    // Listen for "logout" event from the server, and log the user out
    socket.on("logout", () => {
      this.logout();
    });

    // Attach activity event listeners to appropriate DOM elements
    document.addEventListener("mousemove", resetInactivityTimer);
    document.addEventListener("keydown", resetInactivityTimer);
    document.addEventListener("scroll", resetInactivityTimer);
    document.addEventListener("touchstart", resetInactivityTimer);
    document.addEventListener("touchmove", resetInactivityTimer);

    // Emit initial "activity" event to start the inactivity timer
    socket.emit("activity");
  },
  mounted() {
    const { commit } = this.$store;
    const { push } = this.$router;

    fetch("/api/users/me")
      .then((res) => res.json())
      .then(({ authenticated }) => {
        commit("setAuthenticated", authenticated);
        push(authenticated ? "/admin" : "/login");
      })
      .catch(console.error);
  },
  methods: {
    redirect(target) {
      this.$router.push(target);
    },
    async logout() {
      await fetch(`/api/admin/logout`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      document.cookie = "session-id=;expires= Thu, 01 Jan 1970 00:00:01 GMT";
      this.$store.commit("setAuthenticated", false);
      this.redirect("/login");
    },
  },
};
</script>

<style>
@import url("bootstrap/dist/css/bootstrap.css");

html,
body {
  /* https://designs.ai/colors */
  background-color: #9da29267;
}

h1 {
  color: #000;
  font-size: 30px;
  font-weight: 500;
  margin: 10px;
}

#header {
  font-family: "Times New Roman", Times, serif;
  background-color: #9ab6ac;
  border-bottom: 1px solid #b91414;
}
</style>
