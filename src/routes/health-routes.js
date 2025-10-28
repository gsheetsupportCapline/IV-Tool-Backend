const express = require("express");
const router = express.Router();
const {
  healthCheck,
  simpleHealthCheck,
} = require("../controllers/health-controller");

// Comprehensive health check
router.get("/health", healthCheck);

// Simple health check (for load balancers)
router.get("/ping", simpleHealthCheck);

// Alternative simple endpoint
router.get("/health/simple", simpleHealthCheck);

module.exports = router;
