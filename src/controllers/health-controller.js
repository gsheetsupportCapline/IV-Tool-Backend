const mongoose = require("mongoose");

const healthCheck = async (req, res) => {
  try {
    const healthStatus = {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      services: {
        database: "unknown",
        server: "running",
      },
    };

    // Check database connection
    try {
      if (mongoose.connection.readyState === 1) {
        healthStatus.services.database = "connected";
      } else if (mongoose.connection.readyState === 2) {
        healthStatus.services.database = "connecting";
      } else {
        healthStatus.services.database = "disconnected";
        healthStatus.status = "DEGRADED";
      }
    } catch (error) {
      healthStatus.services.database = "error";
      healthStatus.status = "DEGRADED";
    }

    // Set appropriate HTTP status code
    const httpStatus = healthStatus.status === "OK" ? 200 : 503;

    res.status(httpStatus).json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};

const simpleHealthCheck = (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "IV Tool Backend Service is alive",
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  healthCheck,
  simpleHealthCheck,
};
