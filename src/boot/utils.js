import axios from "axios";
import { Converter } from "showdown";

function secondsToDhm(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  const dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
  const hDisplay = h > 0 ? h + "h, " : "";
  const mDisplay = m > 0 ? m + "m" : "";

  const text = dDisplay + hDisplay + mDisplay;
  return text || "0";
}

function timeFromNow(time) {
  // Get timestamps
  let unixTime = new Date(time).getTime();
  if (!unixTime) return;
  let now = new Date().getTime();

  // Calculate difference
  let difference = unixTime / 1000 - now / 1000;

  // Setup return object
  let tfn = {};

  // Check if time is in the past, present, or future
  tfn.when = "now";
  if (difference > 0) {
    tfn.when = "future";
  } else if (difference < -1) {
    tfn.when = "past";
  }

  // Convert difference to absolute
  difference = Math.abs(difference);

  // Calculate time unit
  if (difference / (60 * 60 * 24 * 365) > 1) {
    // Years
    tfn.unitOfTime = "years";
    tfn.time = Math.floor(difference / (60 * 60 * 24 * 365));
  } else if (difference / (60 * 60 * 24 * 45) > 1) {
    // Months
    tfn.unitOfTime = "months";
    tfn.time = Math.floor(difference / (60 * 60 * 24 * 45));
  } else if (difference / (60 * 60 * 24) > 1) {
    // Days
    tfn.unitOfTime = "days";
    tfn.time = Math.floor(difference / (60 * 60 * 24));
  } else if (difference / (60 * 60) > 1) {
    // Hours
    tfn.unitOfTime = "hours";
    tfn.time = Math.floor(difference / (60 * 60));
  } else if (difference / 60 > 1) {
    // Minutes
    tfn.unitOfTime = "minutes";
    tfn.time = Math.floor(difference / 60);
  } else {
    // Seconds
    tfn.unitOfTime = "seconds";
    tfn.time = Math.floor(difference);
  }

  // Return time from now data
  return `${tfn.time} ${tfn.unitOfTime} ago`;
}
let tags = [
  ["r", "wss://relay.damus.io"],
  ["r", "wss://nostr-pub.wellorder.net"],
  ["client", "coracle"],
];

function getTagValues(event, tag) {
  return event.tags.filter(([k, v]) => k == tag).map(([k, v]) => v);
}

function getTagValue(event, tag) {
  return event.tags.find(([k, v]) => k == tag)?.[1];
}

async function markdownToHTML(url) {
  const response = await axios({
    method: "GET",
    withCredentials: false,
    url,
  });

  const converter = new Converter();
  converter.setFlavor("github");
  converter.setOption("simpleLineBreaks", true);
  return converter.makeHtml(response.data);
}

export { secondsToDhm, timeFromNow, getTagValues, markdownToHTML };
