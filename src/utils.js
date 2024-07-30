// utils.js

function getNextFiveWorkingDays() {
  const today = new Date();
  const workingDays = [];

  // Calculate the initial offset to reach the next working day (Monday to Friday)
  let offset = (today.getDay() + 6) % 7; // Maps Sunday (0) to 6, Monday (1) to 0,..., Saturday (6) to 5
  // If today is Friday (5), move to next Monday (3 days ahead), otherwise, move to the next day if it's a weekend
  if (offset >= 5) {
    // Friday, Saturday, or Sunday
    offset += 3; // Move to next Monday
  } else if (offset > 0) {
    // If it's a weekday, just move to the next day
    offset = 1;
  }

  // Calculate the start date by applying the offset
  let startDate = new Date(today.getTime() + offset * 24 * 60 * 60 * 1000);

  // Populate the workingDays array with the next five working days
  for (let i = 0; i < 5; i++) {
    // Skip weekends
    while (startDate.getDay() === 0 || startDate.getDay() === 6) {
      // 0 is Sunday, 6 is Saturday
      startDate.setDate(startDate.getDate() + 1);
    }
    workingDays.push(new Date(startDate)); // Add the working day
    startDate.setDate(startDate.getDate() + 1); // Move to the next day
  }

  console.log("Working days:", workingDays);
  return workingDays;
}

module.exports = { getNextFiveWorkingDays };
