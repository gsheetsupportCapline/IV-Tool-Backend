const mongoose = require("mongoose");
const { ATLAS_DB_URL, NODE_ENV } = require("./server.config");

async function connectToDB() {
  try {
    if (NODE_ENV == "development") {
      await mongoose.connect(
        "mongodb+srv://gsheetsupport:CaplineGSheet2024@cluster0.j81w5we.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
      );
    }
  } catch (error) {
    console.log("Unable to connect to DB Server");
    console.log(error);
  }
}

module.exports = connectToDB;
