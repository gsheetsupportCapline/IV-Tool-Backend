# 🚀 Quick Migration Checklist

## Pre-Migration (Do First!)

- [ ] **Backup Database**

  ```powershell
  mongodump --uri="your_mongodb_uri" --out="./backup-$(Get-Date -Format 'yyyy-MM-dd-HHmmss')"
  ```

- [ ] **Stop Application** (if running)

- [ ] **Verify .env file** has correct MONGODB_URI or MONGO_URL

## Migration Execution

- [ ] **Run Migration Script**

  ```powershell
  node migrate-appointments.js
  ```

- [ ] **Verify Migration Output**
  - Check for "Migration completed successfully!" message
  - Note the backup collection name
  - Verify counts match

## Post-Migration

- [ ] **Update Remaining Code**
  - Search for `$unwind: "$appointments"` in codebase
  - Replace with direct queries on flat documents
  - Update any `"appointments.fieldName"` references

- [ ] **Test Application**

  ```powershell
  npm start
  ```

  - [ ] Test fetching appointments
  - [ ] Test updating appointments
  - [ ] Test creating new appointments
  - [ ] Test user assignments
  - [ ] Test filters and search

- [ ] **Verify Data Integrity**

  ```javascript
  // In MongoDB:
  // Check total count
  db.appointments.countDocuments();

  // Check sample data
  db.appointments.findOne();

  // Verify officeName exists
  db.appointments.find({ officeName: { $exists: false } }).count(); // Should be 0
  ```

- [ ] **Re-enable Cron Job** (after testing)
  ```javascript
  // src/index.js - uncomment line:
  setupJob();
  ```

## Verification

- [ ] No errors in application logs
- [ ] Queries are faster
- [ ] Updates work correctly
- [ ] New appointments are created properly

## If Everything Works (After 1-2 Weeks)

- [ ] **Delete Backup Collection**
  ```javascript
  db.appointments_backup_TIMESTAMP.drop();
  ```

## Emergency Rollback (If Needed)

```powershell
# 1. Stop application
# 2. In MongoDB:
use your_database
db.appointments.drop()
db.appointments_backup_TIMESTAMP.aggregate([{ $out: "appointments" }])

# 3. Restore old files:
# - Rename appointment.old.js to appointment.js
# - Use appointment-repository.old.js
# - Re-enable cron if needed
```

---

## Quick Commands

```powershell
# Navigate to project
cd "c:\Users\Vishu Sharma\OneDrive\Desktop\Server Apps\IV-Tool-Backend"

# Backup database
mongodump --uri="your_uri" --out="./backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Run migration
node migrate-appointments.js

# Start server
npm start

# Check logs
Get-Content -Path ".\logs\app.log" -Tail 50 -Wait
```

---

**⚠️ CRITICAL:** Always backup before migration!  
**📝 Document:** Backup collection name for rollback  
**🧪 Test:** Thoroughly before re-enabling cron job
