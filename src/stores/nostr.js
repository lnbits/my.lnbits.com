import { defineStore } from "pinia";
import { SimplePool } from "nostr-tools/pool";

const pool = new SimplePool();

const defaultRelays = [
  "wss://relay.damus.io/",
  "wss://relay.snort.social/",
  "wss://relay.nostr.band/",
  "wss://nostr-pub.wellorder.net/",
];

export const useNostrStore = defineStore("nostr", {
  state: () => ({
    relays: new Set(defaultRelays),
    pubkeys: new Set(),
    profiles: new Map(), // there can be more profiles for the same public key
    pool: pool,
  }),
  getters: {
    // showCard: (state) => {
    //   return state.handle.length > 0;
    // },
  },
  actions: {
    // resetHandle() {
    //   this.handle = "";
    //   this.handleData = {};
    //   this.buying = false;
    // },
    addRelay(relay) {
      this.relays.add(relay);
    },
    removeRelay(relay) {
      this.relays.delete(relay);
    },
    addPubkey(pubkey) {
      this.pubkeys.add(pubkey);
    },
    removePubkey(pubkey) {
      this.pubkeys.delete(pubkey);
    },
    addProfile(event) {
      let profile = JSON.parse(event.content);
      if (
        !this.profiles.has(event.pubkey) ||
        this.profiles.get(event.pubkey).created_at < event.created_at
      ) {
        this.profiles.set(event.pubkey, profile);
      }
    },
    addRelaysToProfile(pubkey, relays) {
      if (this.profiles.has(pubkey)) {
        this.profiles.get(pubkey).relays = relays;
      }
    },
  },
});
