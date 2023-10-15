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
                </ul>
              </li>
              <!-- Time slot button -->
              <li class="nav-item">
                <router-link class="nav-link" to="/showtimeslots"
                  >All Documents</router-link
                >
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
import activityMixin from "./views/activityMixin";

export default {
  name: "App",
  mixins: [activityMixin],
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
      this.redirect("/showtimeslots");
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
