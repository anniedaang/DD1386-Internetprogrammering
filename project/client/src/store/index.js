import { createStore } from "vuex";

export default createStore({
  state: {
    authenticated: false,
    username: "",
    timeslots: [],
    target: "",
  },
  getters: {
    isAuthenticated(state) {
      return state.authenticated;
    },
    getUsername(state) {
      return state.username;
    },
    getTimeslots(state) {
      return state.timeslots;
    },
  },
  mutations: {
    setAuthenticated(state, authenticated) {
      state.authenticated = authenticated;
    },
    setUsername(state, username) {
      state.username = username;
    },
    setTimeSlots(state, timeslots) {
      // set the new timeslots array
      state.timeslots = timeslots;
    },
    sortTimeSlots(state) {
      state.timeslots.sort((a, b) => {
        const timeA = new Date(`01/01/2000 ${a.time}`);
        const timeB = new Date(`01/01/2000 ${b.time}`);
        return timeA - timeB;
      });
    },
    clearUsername(state) {
      state.username = "";
    },
    clearAuth(state) {
      state.authenticated = false;
    },
    updateTimeSlot(state, updatedTimeSlot) {
      // find the timeslot in the array and update it
      const index = state.timeslots.findIndex(
        (item) =>
          item.time === updatedTimeSlot.time &&
          item.room === updatedTimeSlot.room
      );
      state.timeslots[index] = updatedTimeSlot;
    },
  },
});
