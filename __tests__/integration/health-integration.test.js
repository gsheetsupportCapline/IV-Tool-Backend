const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Mock mongoose connection for integration tests
const mockMongoose = {
  connection: {
    readyState: 1,
  },
};

jest.mock("mongoose", () => mockMongoose);

// Import your main app setup
const healthRoutes = require("../../src/routes/health-routes");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(cors());
app.use("/api", healthRoutes);

describe("Health Check Integration Tests", () => {
  describe("Health endpoints", () => {
    it("should respond to health check endpoint", async () => {
      mockMongoose.connection.readyState = 1; // Connected

      const response = await request(app).get("/api/health").expect(200);

      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("uptime");
    });

    it("should respond to ping endpoint", async () => {
      const response = await request(app).get("/api/ping").expect(200);

      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty("message");
    });

    it("should respond to simple health endpoint", async () => {
      const response = await request(app).get("/api/health/simple").expect(200);

      expect(response.body).toHaveProperty("status", "OK");
    });
  });
});
