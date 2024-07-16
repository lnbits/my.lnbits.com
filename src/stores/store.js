import { defineStore } from "pinia";

export const useAppStore = defineStore("store", {
  state: () => ({
    newCartIdentifier: null,
    username: null,
    handle: "",
    handleData: {},
    buying: false,
    identities: new Map(),
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
    addIdentity(identity) {
      this.identities.set(identity.id, identity);
    },
  },
});
