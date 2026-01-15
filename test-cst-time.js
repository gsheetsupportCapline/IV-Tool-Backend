const moment = require("moment-timezone");

console.log("=== Testing CST/CT Timezone ===\n");

// Current implementation
const texasTime = moment.tz("America/Chicago").toDate();

console.log("Using moment.tz('America/Chicago'):");
console.log("Date object:", texasTime);
console.log("ISO String (UTC):", texasTime.toISOString());
console.log("Local String:", texasTime.toString());
console.log("\n");

// Show what time it is in Chicago right now
const chicagoMoment = moment.tz("America/Chicago");
console.log("Current time in Chicago (America/Chicago):");
console.log("Formatted:", chicagoMoment.format("YYYY-MM-DD hh:mm:ss A"));
console.log("Timezone:", chicagoMoment.format("z"));
console.log("UTC Offset:", chicagoMoment.format("Z"));
console.log("\n");

// Show UTC time
const utcMoment = moment.utc();
console.log("Current UTC time:");
console.log("Formatted:", utcMoment.format("YYYY-MM-DD HH:mm:ss"));
console.log("\n");

// Important: When saved to MongoDB
console.log("=== What MongoDB will store ===");
console.log("MongoDB stores dates in UTC format");
console.log("Stored value:", texasTime.toISOString());
console.log("\n");

console.log("=== Expected vs Actual ===");
console.log("Expected CT time: 2:09 PM (Thursday, 15 January 2026)");
console.log(
  "Actual CT time:",
  chicagoMoment.format("h:mm A (dddd, DD MMMM YYYY)")
);
