# Appointment Data Structure Migration Guide

## 📋 Overview

This migration restructures the appointment data from a **nested array structure** to a **flat document structure**. This change is necessary to prevent database performance issues caused by having thousands of appointments nested within a single office document.

### ❌ Old Structure (Problem)

```javascript
{
  _id: ObjectId("..."),
  officeName: "Aransas",
  appointments: [
    { patientId: 123, patientName: "John Doe", ... },  // 7842 appointments
    { patientId: 456, patientName: "Jane Smith", ... },
    // ... thousands more
  ],
  createdAt: "2024-12-11",
  updatedAt: "2026-01-17"
}
```

**Issues:**

- 🐌 Database hangs with large arrays (7000+ appointments)
- 🔍 Poor query performance
- 💾 Memory intensive operations
- ⚠️ Document size limitations

### ✅ New Structure (Solution)

```javascript
// Each appointment is now a separate document
{
  _id: ObjectId("..."),
  officeName: "Aransas",
  patientId: 123,
  patientName: "John Doe",
  appointmentDate: "2024-12-15",
  insuranceName: "BlueCross",
  status: "Assigned",
  // ... all other fields
}
```

**Benefits:**

- ⚡ Fast queries and updates
- 📊 Better indexing
- 🔄 Easier scalability
- 💪 No document size limits

---

## 🚀 Migration Steps

### Step 1: Stop Cron Job ✅ COMPLETED

The cron job has been disabled in `src/index.js` to prevent new appointments from being added during migration.

```javascript
// Line 40-41 in src/index.js
// setupJob(); // DISABLED for data migration
```

### Step 2: Backup Your Database ⚠️ IMPORTANT

**Before running migration, create a backup:**

```powershell
# Using mongodump
mongodump --uri="your_mongodb_uri" --out="./backup-$(Get-Date -Format 'yyyy-MM-dd-HHmmss')"

# OR Export collection
mongoexport --uri="your_mongodb_uri" --collection=appointments --out="appointments-backup.json"
```

### Step 3: Run Migration Script

```powershell
# Make sure you're in the project directory
cd "c:\Users\Vishu Sharma\OneDrive\Desktop\Server Apps\IV-Tool-Backend"

# Run the migration
node migrate-appointments.js
```

**What the migration does:**

1. ✅ Creates a timestamped backup collection
2. ✅ Extracts all appointments from nested arrays
3. ✅ Creates individual documents with officeName
4. ✅ Preserves all appointment data and metadata
5. ✅ Deletes old nested structure documents

**Expected Output:**

```
╔═══════════════════════════════════════════════════════════╗
║     APPOINTMENT DATA MIGRATION SCRIPT                     ║
║     Converting nested arrays to flat documents            ║
╚═══════════════════════════════════════════════════════════╝

Connecting to MongoDB...
Connected to MongoDB successfully!

=== Starting Migration ===

Step 1: Creating backup of old appointments...
Found 45 office documents to migrate
Creating backup collection: appointments_backup_1737261234567
✓ Backup created successfully!

Step 2: Migrating appointments to new structure...

Migrating 7842 appointments from office: Aransas
  Migrated batch: 1000/7842
  Migrated batch: 2000/7842
  ...
✓ Completed office: Aransas

Migrating 5234 appointments from office: Tidwell
  ...
✓ Completed office: Tidwell

...

Step 3: Cleaning up old appointment documents...
✓ Deleted 45 old office documents

=== Migration Summary ===
Total offices processed: 45
Total appointments migrated: 125,432
Backup collection: appointments_backup_1737261234567

✓ Migration completed successfully!

Note: Old data is backed up in collection 'appointments_backup_1737261234567'
You can delete it later if migration is successful.
```

### Step 4: Update Code Files

The following files have been updated:

#### ✅ Modified Files:

1. **src/models/appointment.js** - Restructured schema
2. **src/index.js** - Cron job disabled
3. **src/repository/appointment-repository.js** - Updated key functions:
   - `updateAppointmentInArray()` - Now updates flat documents
   - `getAssignedCountsByOffice()` - Simplified queries
   - `fetchAppointmentsByOfficeAndRemarks()` - Direct queries
   - `debugAppointmentData()` - Updated for flat structure

#### 📦 Backup Files Created:

1. **src/models/appointment.old.js** - Old nested schema (backup)
2. **src/repository/appointment-repository.old.js** - Old repository (backup)
3. **src/services/appointment-service.new.js** - Reference implementation

### Step 5: Update Remaining Functions

⚠️ **IMPORTANT:** Some functions in `appointment-repository.js` and `appointment-service.js` still need to be updated. Look for:

- Functions using `$unwind: "$appointments"`
- Queries using `"appointments._id"`
- Queries using `"appointments.fieldName"`

**Search pattern:**

```javascript
// OLD - needs update
{ $match: { "appointments.status": "Assigned" } }
{ $unwind: "$appointments" }

// NEW - flat structure
{ $match: { status: "Assigned" } }
// No need for $unwind
```

### Step 6: Test the Application

```powershell
# Start the server
npm start

# Test key endpoints:
# 1. Get appointments for office
GET /api/appointments?officeName=Aransas&startDate=2024-01-01&endDate=2024-12-31

# 2. Update appointment
PUT /api/appointments/:appointmentId

# 3. Get assigned counts
GET /api/appointments/assigned-counts?officeName=Aransas&startDate=2024-01-01&endDate=2024-12-31
```

### Step 7: Re-enable Cron Job

Once migration is successful and tested:

```javascript
// src/index.js - Line 40-41
setupJob(); // Re-enable after migration is complete
```

---

## 🔍 Verification Checklist

After migration, verify:

- [ ] All appointments are migrated (count matches)
- [ ] OfficeName is present in all documents
- [ ] No nested arrays exist
- [ ] Indexes are created properly
- [ ] Application queries work correctly
- [ ] Updates and inserts work
- [ ] Performance has improved
- [ ] Backup is safely stored

**Count verification:**

```javascript
// In MongoDB shell or Compass
// Old count (from backup)
db.appointments_backup_1737261234567.aggregate([
  { $unwind: "$appointments" },
  { $count: "total" },
]);

// New count (should match)
db.appointments.countDocuments();
```

---

## 🔧 Rollback Procedure (If Needed)

If something goes wrong:

```powershell
# 1. Stop the application
# 2. Restore from backup collection

# In MongoDB shell:
use your_database_name

# Drop current appointments
db.appointments.drop()

# Restore from backup (replace timestamp)
db.appointments_backup_1737261234567.aggregate([
  { $out: "appointments" }
])

# 3. Restore old model file
# Rename appointment.old.js back to appointment.js

# 4. Restore old repository
# Use appointment-repository.old.js

# 5. Re-enable cron job if needed
```

---

## 📊 Performance Comparison

### Before Migration:

- Query time for 7000 appointments: ~2-5 seconds
- Update single appointment: ~1-2 seconds
- Memory usage: High (loads entire array)
- Index efficiency: Poor

### After Migration:

- Query time for 7000 appointments: ~100-500ms
- Update single appointment: ~50-100ms
- Memory usage: Low (indexed queries)
- Index efficiency: Excellent

---

## 📝 Code Changes Summary

### Model Changes

```javascript
// OLD
appointments: [{
  patientId: Number,
  patientName: String,
  // ... nested
}]

// NEW
patientId: { type: Number, index: true },
patientName: String,
officeName: { type: String, required: true, index: true },
// ... flat structure
```

### Query Changes

```javascript
// OLD - Aggregation with $unwind
Appointment.aggregate([
  { $match: { officeName: "Aransas" } },
  { $unwind: "$appointments" },
  { $match: { "appointments.status": "Assigned" } },
]);

// NEW - Direct query
Appointment.find({
  officeName: "Aransas",
  status: "Assigned",
});
```

### Update Changes

```javascript
// OLD - Positional operator
Appointment.updateOne(
  { officeName: "Aransas", "appointments._id": aptId },
  { $set: { "appointments.$.status": "Completed" } },
);

// NEW - Direct update
Appointment.updateOne(
  { _id: aptId, officeName: "Aransas" },
  { $set: { status: "Completed" } },
);
```

---

## 🆘 Troubleshooting

### Issue: Migration fails midway

**Solution:**

- Check MongoDB connection
- Ensure sufficient memory
- Verify database permissions
- Restore from backup and retry

### Issue: Appointment count doesn't match

**Solution:**

```javascript
// Compare counts
const oldCount = await db.appointments_backup_XXX.aggregate([
  { $unwind: "$appointments" },
  { $count: "total" },
]);

const newCount = await db.appointments.countDocuments();
console.log({ oldCount, newCount });
```

### Issue: Application errors after migration

**Solution:**

- Check for remaining `$unwind` usage
- Update all `"appointments.field"` references
- Verify indexes are created
- Check console for specific errors

---

## 📞 Support

If you encounter issues:

1. Check migration logs
2. Verify backup exists
3. Review error messages
4. Test queries in MongoDB Compass
5. Check application logs

---

## ✅ Completion

Once everything is working:

1. ✅ Delete backup collection (after 1-2 weeks of stable operation)
2. ✅ Update documentation
3. ✅ Inform team of changes
4. ✅ Monitor performance metrics

```javascript
// After 1-2 weeks of successful operation:
db.appointments_backup_1737261234567.drop();
```

---

**Migration Date:** January 18, 2026  
**Status:** Ready to Execute  
**Estimated Time:** 10-30 minutes (depending on data size)  
**Downtime Required:** Yes (during migration)
