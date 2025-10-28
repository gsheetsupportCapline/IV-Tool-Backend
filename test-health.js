const axios = require("axios");

const BASE_URL = "http://localhost:7477";

async function testHealthEndpoints() {
  console.log("🏥 Testing Health Check Endpoints...\n");

  try {
    // Test comprehensive health check
    console.log("1. Testing /api/health endpoint:");
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log("✅ Status:", healthResponse.status);
    console.log("📊 Response:", JSON.stringify(healthResponse.data, null, 2));
    console.log("");

    // Test simple ping
    console.log("2. Testing /api/ping endpoint:");
    const pingResponse = await axios.get(`${BASE_URL}/api/ping`);
    console.log("✅ Status:", pingResponse.status);
    console.log("📊 Response:", JSON.stringify(pingResponse.data, null, 2));
    console.log("");

    // Test simple health
    console.log("3. Testing /api/health/simple endpoint:");
    const simpleResponse = await axios.get(`${BASE_URL}/api/health/simple`);
    console.log("✅ Status:", simpleResponse.status);
    console.log("📊 Response:", JSON.stringify(simpleResponse.data, null, 2));
    console.log("");

    console.log("🎉 All health check endpoints are working correctly!");
  } catch (error) {
    console.error("❌ Error testing health endpoints:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

// Run the test
testHealthEndpoints();
