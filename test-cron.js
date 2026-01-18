const http = require("http");

async function testCronJob() {
  try {
    console.log(
      "Testing cron job by calling fetch-and-save-appointments endpoint...",
    );
    console.log(
      "This will fetch appointments from Google Sheets and save them as flat documents",
    );
    console.log("-------------------------------------------\n");

    const options = {
      hostname: "localhost",
      port: 5000,
      path: "/api/appointments/fetch-and-save-appointments",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log("\n✅ Success!");
        console.log("Status Code:", res.statusCode);
        console.log("Response:", data);
        console.log(
          "\n⚠️ Check the server console logs above to see the detailed appointment processing",
        );
        process.exit(0);
      });
    });

    req.on("error", (error) => {
      console.error("\n❌ Error occurred:");
      console.error("Error:", error.message);
      console.error("\n⚠️ Make sure the server is running on port 5000");
      process.exit(1);
    });

    req.end();
  } catch (error) {
    console.error("\n❌ Error occurred:");
    console.error("Error:", error.message);
    process.exit(1);
  }
}

testCronJob();
