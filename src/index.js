const express = require("express");
const bodyParser = require("body-parser");
const appointmentRoutes = require("./routes/appointment-routes");
const officeRoutes = require("./routes/office-routes");
const userRoutes = require("./routes/user-routes.js");
const authRoutes = require("./routes/auth-routes.js");
const dropdownValuesRoutes = require("./routes/dropdownValues-routes.js");
const imageUploadRoutes = require("./routes/fileUpload-routes.js");
const googleSheetsRoutes = require("./routes/googleSheetsRoutes.js");
const userUpdateRoutes = require("./routes/user-update-routes.js");
const officeDataRoutes = require("./routes/officeData-routes.js");
const attendanceRoutes = require("./routes/attendance-routes.js");
const healthRoutes = require("./routes/health-routes.js");
const cors = require("cors");

const setupJob = require("./cronJobs/appointmentFetcher");
const { PORT } = require("./config/server.config");
const connectToDB = require("./config/db.config");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(cors());

// Health check routes (add these before other routes)
app.use("/api", healthRoutes);

app.use("/api/appointments", appointmentRoutes);
app.use("/api/offices", officeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dropdownValues", dropdownValuesRoutes);
app.use("/api/image-upload", imageUploadRoutes);
app.use("/api/spreadsheet", googleSheetsRoutes);
app.use("/api/user-update", userUpdateRoutes);
app.use("/api/office-data", officeDataRoutes);
app.use("/api/attendance", attendanceRoutes);

setupJob(); // setup Cron Job

app.listen(PORT, async () => {
  console.log(`Server started at PORT :${PORT}`);
  await connectToDB();
});
