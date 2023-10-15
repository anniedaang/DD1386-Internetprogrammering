import io from "socket.io-client";

export const userActivityMixin = {
    data() {
        return {
            userActivitySocket: null,
        };

    },
    mounted() {
        // Connect to the server using Socket.io
        this.userActivitySocket = io();

        // Emit the "activity" event to the server whenever the user performs an activity
        document.addEventListener("mousemove", this.emitUserActivity);
        document.addEventListener("keydown", this.emitUserActivity);
        document.addEventListener("click", this.emitUserActivity);

        // Listen for the "logout" event emitted by the server
        const socket = io("/");
        socket.on("logout", () => {
        console.debug("Received logout event");
        this.logout();
        });
    },

    methods: {
        async logout() {
            // Log out the user
            await fetch("/api/admin/logout", {
                method: "DELETE",
                headers: {"Content-Type": "application/json"},
            });

            document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            this.$store.commit("setAuthenticated", false);
            this.$router.push("/login");
        },

        emitUserActivity() {
            this.userActivitySocket.emit("activity");
        },
    },
};

export default userActivityMixin;