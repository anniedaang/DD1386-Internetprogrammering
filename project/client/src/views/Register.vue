<template>
  <div class="row">
    <div class="col"></div>
    <form class="col" @submit.prevent="register()">
      <h4 class="title-1 text-center font-italic">
        Register for a new account
      </h4>
      <div class="form-group">
        <label for="username">Username:</label>
        <input
          id="username"
          v-model="username"
          type="text"
          class="form-control"
          placeholder="enter username"
          required
        />
      </div>
      <p />
      <div class="form-group">
        <label for="password">Password:</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="form-control"
          placeholder="enter password"
          required
        />
      </div>
      <p />
      <div class="form-group">
        <label for="confirmPassword">Confirm Password:</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          class="form-control"
          placeholder="enter password again"
          required
        />
      </div>
      <div v-if="failedRegister" class="alert alert-danger">{{ msg }}</div>
      <button type="submit" class="btn btn-primary mt-4">Register</button>
    </form>
    <div class="col"></div>
  </div>
</template>

<script>
export default {
  name: "RegisterView",
  data() {
    return {
      username: "",
      password: "",
      confirmPassword: "",
      failedRegister: false,
      msg: "",
    };
  },
  methods: {
    async register() {
      if (this.password !== this.confirmPassword) {
        this.failedRegister = true;
        this.msg = "Passwords do not match";
        return;
      }

      fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
          confirm: this.confirmPassword,
        }),
      })
        .then((response) => {
          if (response.ok) {
            // Registration successful - redirect to login
            this.$router.push("/login");
          } else {
            // Registration failed. Handle the error or display an error message
            response.json().then((data) => {
              this.failedRegister = true;
              this.msg = data.error || "Registration failed";
            });
          }
        })
        .catch((error) => {
          // Registration failed. Handle the error or display an error message
          console.error(error);
          this.failedRegister = true;
          this.msg = "Registration failed";
        });
    },
  },
};
</script>
