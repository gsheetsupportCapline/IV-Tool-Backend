/**
 * DATA MIGRATION SCRIPT
 * Purpose: Migrate appointments from nested array structure to flat structure
 *
 * OLD STRUCTURE:
 * {
 *   officeName: "Aransas",
 *   appointments: [ {...}, {...}, ... ] // 7842 appointments in one document
 * }
 *
 * NEW STRUCTURE:
 * { officeName: "Aransas", appointmentDate: ..., patientName: ..., ... }
 * { officeName: "Aransas", appointmentDate: ..., patientName: ..., ... }
 * Each appointment is now a separate document
 */

const mongoose = require("mongoose");
require("dotenv").config();

// Old schema definition for reading existing data
const appointmentOldSchema = new mongoose.Schema(
  {
    officeName: String,
    appointments: [
      {
        appointmentType: String,
        appointmentDate: Date,
        appointmentTime: String,
        patientId: Number,
        patientName: String,
        patientDOB: String,
        MIDSSN: String,
        insuranceName: String,
        insurancePhone: String,
        policyHolderName: String,
        policyHolderDOB: String,
        memberId: String,
        employerName: String,
        groupNumber: String,
        relationWithPatient: String,
        medicaidId: String,
        carrierId: String,
        confirmationStatus: String,
        confirmationDate: Date,
        endTime: Date,
        cellPhone: String,
        homePhone: String,
        workPhone: String,
        ivType: String,
        completionStatus: String,
        status: String,
        assignedUser: String,
        provider: String,
        lastUpdatedAt: Date,
        ivRemarks: String,
        source: String,
        planType: String,
        completedBy: String,
        ivRequestedDate: Date,
        ivAssignedDate: Date,
        ivCompletedDate: Date,
        ivAssignedByUserName: String,
        noteRemarks: String,
        imageUrl: String,
      },
    ],
  },
  { timestamps: true },
);

async function migrateData() {
  try {
    // Connect to MongoDB
    const mongoURI =
      process.env.ATLAS_DB_URL ||
      process.env.MONGODB_URI ||
      process.env.MONGO_URL;
    if (!mongoURI) {
      throw new Error(
        "MongoDB URI not found in environment variables. Please check ATLAS_DB_URL in .env file",
      );
    }

    console.log("Connecting to MongoDB...");
    console.log(
      "Using database:",
      mongoURI.replace(/mongodb:\/\/([^:]+):?([^@]*)@?/, "mongodb://***:***@"),
    );
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB successfully!");

    console.log("\n=== Starting Migration ===\n");

    // Step 1: Backup old data to a new collection
    console.log("Step 1: Creating backup of old appointments...");
    const db = mongoose.connection.db;
    const backupCollectionName = `appointments_backup_${Date.now()}`;
    console.log(`Creating backup collection: ${backupCollectionName}`);
    await db
      .collection("appointments")
      .aggregate([{ $out: backupCollectionName }])
      .toArray();
    console.log("✓ Backup created successfully!");

    // Step 2: Read old structure from BACKUP collection
    const oldAppointments = await db
      .collection(backupCollectionName)
      .find({})
      .toArray();
    console.log(`Found ${oldAppointments.length} office documents to migrate`);

    // Step 3: Clear appointments collection
    console.log("\nStep 2: Clearing appointments collection...");
    await db.collection("appointments").deleteMany({});
    console.log("✓ Appointments collection cleared");

    // Step 4: Transform and insert new documents
    console.log("\nStep 3: Migrating appointments to new structure...");
    let totalAppointmentsMigrated = 0;
    let batchSize = 1000;

    for (const officeDoc of oldAppointments) {
      const officeName = officeDoc.officeName;
      const appointments = officeDoc.appointments || [];

      console.log(
        `\nMigrating ${appointments.length} appointments from office: ${officeName}`,
      );

      // Process in batches to avoid memory issues
      for (let i = 0; i < appointments.length; i += batchSize) {
        const batch = appointments.slice(i, i + batchSize);

        const newAppointments = batch.map((apt) => ({
          officeName: officeName,
          appointmentType: apt.appointmentType,
          appointmentDate: apt.appointmentDate,
          appointmentTime: apt.appointmentTime,
          patientId: apt.patientId,
          patientName: apt.patientName,
          patientDOB: apt.patientDOB,
          MIDSSN: apt.MIDSSN,
          insuranceName: apt.insuranceName,
          insurancePhone: apt.insurancePhone,
          policyHolderName: apt.policyHolderName,
          policyHolderDOB: apt.policyHolderDOB,
          memberId: apt.memberId,
          employerName: apt.employerName,
          groupNumber: apt.groupNumber,
          relationWithPatient: apt.relationWithPatient,
          medicaidId: apt.medicaidId,
          carrierId: apt.carrierId,
          confirmationStatus: apt.confirmationStatus,
          confirmationDate: apt.confirmationDate,
          endTime: apt.endTime,
          cellPhone: apt.cellPhone,
          homePhone: apt.homePhone,
          workPhone: apt.workPhone,
          ivType: apt.ivType || "Normal",
          completionStatus: apt.completionStatus || "IV Not Done",
          status: apt.status || "Unassigned",
          assignedUser: apt.assignedUser,
          provider: apt.provider,
          lastUpdatedAt: apt.lastUpdatedAt,
          ivRemarks: apt.ivRemarks,
          source: apt.source,
          planType: apt.planType,
          completedBy: apt.completedBy,
          ivRequestedDate: apt.ivRequestedDate,
          ivAssignedDate: apt.ivAssignedDate,
          ivCompletedDate: apt.ivCompletedDate,
          ivAssignedByUserName: apt.ivAssignedByUserName,
          noteRemarks: apt.noteRemarks,
          imageUrl: apt.imageUrl,
          createdAt: officeDoc.createdAt,
          updatedAt: officeDoc.updatedAt,
        }));

        await db
          .collection("appointments")
          .insertMany(newAppointments, { ordered: false });
        totalAppointmentsMigrated += newAppointments.length;
        console.log(
          `  Migrated batch: ${Math.min(i + batchSize, appointments.length)}/${appointments.length}`,
        );
      }

      console.log(`✓ Completed office: ${officeName}`);
    }

    // Summary
    console.log("\n=== Migration Summary ===");
    console.log(`Total offices processed: ${oldAppointments.length}`);
    console.log(`Total appointments migrated: ${totalAppointmentsMigrated}`);
    console.log(`Backup collection: ${backupCollectionName}`);
    console.log(`\n✓ Migration completed successfully!`);
    console.log(
      `\nNote: Old data is backed up in collection '${backupCollectionName}'`,
    );
    console.log(`You can delete it later if migration is successful.`);

    // Verify the migration
    console.log("\n=== Verification ===");
    const newCount = await db.collection("appointments").countDocuments();
    console.log(`New appointments collection count: ${newCount}`);

    const sampleNew = await db.collection("appointments").findOne();
    console.log("\nSample new document structure:");
    console.log(
      `- Has officeName at root: ${sampleNew?.officeName ? "✓" : "✗"}`,
    );
    console.log(
      `- Has appointments array: ${sampleNew?.appointments ? "✗ (should not have)" : "✓"}`,
    );
    console.log(`- Structure is flat: ${!sampleNew?.appointments ? "✓" : "✗"}`);

    // Close connection
    await mongoose.connection.close();
    console.log("\nDatabase connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed with error:", error);
    console.error(error.stack);

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run migration
console.log("╔═══════════════════════════════════════════════════════════╗");
console.log("║     APPOINTMENT DATA MIGRATION SCRIPT                     ║");
console.log("║     Converting nested arrays to flat documents            ║");
console.log("╚═══════════════════════════════════════════════════════════╝\n");

migrateData();
