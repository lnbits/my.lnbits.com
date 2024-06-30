import { defineStore } from "pinia";

export const useAppStore = defineStore("store", {
  state: () => ({
    username: null,
    handle: "",
    handleData: {},
    buying: false,
  }),
  getters: {
    showCard: (state) => {
      return state.handle.length > 0;
    },
    isLoggedIn(state) {
      return state.username !== null;
    },
  },
  actions: {
    resetHandle() {
      this.handle = "";
      this.handleData = {};
      this.buying = false;
    },
  },
});
