const express = require("express");
const bodyParser = require("body-parser");
const appointmentRoutes = require("./routes/appointment-routes");
const officeRoutes = require("./routes/office-routes");
const userRoutes = require("./routes/user-routes.js");
const authRoutes = require("./routes/auth-routes.js");
const dropdownValuesRoutes = require("./routes/dropdownValues-routes.js")
const cors = require("cors");

const setupJob = require("./cronJobs/appointmentFetcher");
const { PORT } = require("./config/server.config");
const connectToDB = require("./config/db.config");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(cors());

app.use("/api/appointments", appointmentRoutes);
app.use("/api/offices", officeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dropdownValues", dropdownValuesRoutes);

app.get("/ping", (req, res) => {
  return res.json({ message: `IV Tool Backend Service is alive` });
});

setupJob(); // setup Cron Job

app.listen(PORT, async () => {
  console.log(`Server started at PORT :${PORT}`);
  await connectToDB();
  console.log("Successfully connected to DB");
});
