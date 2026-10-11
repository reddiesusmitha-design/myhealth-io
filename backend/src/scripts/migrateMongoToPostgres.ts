import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

interface MigrationStats {
  collection: string;
  sourceCount: number;
  migratedCount: number;
  skippedCount: number;
  errorCount: number;
}

export async function runMigration() {
  const mongoUrl = (process.env.MONGODB_URI || process.env.DB_URL || '').trim();
  const postgresUrl = (process.env.DATABASE_URL || '').trim();

  console.log('=================================================================');
  console.log('       MyHealthIO MongoDB Atlas ➔ Supabase PostgreSQL Migration    ');
  console.log('=================================================================\n');

  if (!mongoUrl) {
    console.error('❌ Error: MONGODB_URI or DB_URL is missing in environment variables.');
    return;
  }

  if (!postgresUrl || (!postgresUrl.startsWith('postgresql://') && !postgresUrl.startsWith('postgres://'))) {
    console.error('❌ Error: DATABASE_URL must be a valid PostgreSQL connection string starting with postgresql:// or postgres://');
    console.log('ℹ️  Please provide your Supabase PostgreSQL DATABASE_URL in backend/.env to execute the transfer.');
    return;
  }

  console.log('Connecting to MongoDB Atlas source...');
  await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 8000 });
  console.log('✅ Connected to MongoDB Atlas.\n');

  console.log('Connecting to Supabase PostgreSQL destination...');
  await prisma.$connect();
  console.log('✅ Connected to PostgreSQL destination.\n');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Could not access MongoDB database instance.');
  }

  const stats: MigrationStats[] = [];

  try {
    // 1. Migrate Users
    console.log('▶ [1/9] Migrating Users...');
    const userDocs = await db.collection('users').find({}).toArray();
    let usersMigrated = 0;
    let usersSkipped = 0;
    let usersErrors = 0;

    for (const doc of userDocs) {
      const id = doc._id.toString();
      try {
        await prisma.user.upsert({
          where: { id },
          update: {
            email: doc.email,
            passwordHash: doc.passwordHash,
            fullName: doc.fullName || 'User',
            mockAbhaId: doc.mockAbhaId || `ABHA-91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
            preferredLanguage: doc.preferredLanguage || 'en',
            dateOfBirth: doc.dateOfBirth ? new Date(doc.dateOfBirth) : null,
            gender: doc.gender || null,
            bloodGroup: doc.bloodGroup || 'O+',
            emergencyContact: doc.emergencyContact || '',
            allergies: Array.isArray(doc.allergies) ? doc.allergies : [],
            chronicConditions: Array.isArray(doc.chronicConditions) ? doc.chronicConditions : [],
          },
          create: {
            id,
            email: doc.email,
            passwordHash: doc.passwordHash,
            fullName: doc.fullName || 'User',
            mockAbhaId: doc.mockAbhaId || `ABHA-91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
            preferredLanguage: doc.preferredLanguage || 'en',
            dateOfBirth: doc.dateOfBirth ? new Date(doc.dateOfBirth) : null,
            gender: doc.gender || null,
            bloodGroup: doc.bloodGroup || 'O+',
            emergencyContact: doc.emergencyContact || '',
            allergies: Array.isArray(doc.allergies) ? doc.allergies : [],
            chronicConditions: Array.isArray(doc.chronicConditions) ? doc.chronicConditions : [],
            createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
            updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
          },
        });
        usersMigrated++;
      } catch (err: any) {
        console.error(`  - Failed to migrate user ${id}: ${err.message}`);
        usersErrors++;
      }
    }
    stats.push({ collection: 'users', sourceCount: userDocs.length, migratedCount: usersMigrated, skippedCount: usersSkipped, errorCount: usersErrors });

    // 2. Migrate Medical Reports
    console.log('▶ [2/9] Migrating Medical Reports...');
    const reportDocs = await db.collection('medicalreports').find({}).toArray();
    let reportsMigrated = 0;
    let reportsSkipped = 0;
    let reportsErrors = 0;

    for (const doc of reportDocs) {
      const id = doc._id.toString();
      const userId = doc.userId?.toString();
      try {
        await prisma.medicalReport.upsert({
          where: { id },
          update: {
            originalFilename: doc.originalFilename || 'Document.pdf',
            filePath: doc.filePath || '',
            mimeType: doc.mimeType || 'application/pdf',
            fileSizeBytes: BigInt(doc.fileSizeBytes || 0),
            documentType: doc.documentType || 'LAB_REPORT',
            documentDate: doc.documentDate ? new Date(doc.documentDate) : new Date(),
            facility: doc.facility || 'Clinical Lab',
            extractedRawText: doc.extractedRawText || '',
            processingStatus: doc.processingStatus || 'COMPLETED',
            ocrConfidence: doc.ocrConfidence || 95.0,
            flaggedCount: doc.flaggedCount || 0,
            fields: Array.isArray(doc.fields) ? doc.fields : [],
            labs: Array.isArray(doc.labs) ? doc.labs : [],
            medications: Array.isArray(doc.medications) ? doc.medications : [],
            summary: doc.summary || null,
          },
          create: {
            id,
            userId,
            originalFilename: doc.originalFilename || 'Document.pdf',
            filePath: doc.filePath || '',
            mimeType: doc.mimeType || 'application/pdf',
            fileSizeBytes: BigInt(doc.fileSizeBytes || 0),
            documentType: doc.documentType || 'LAB_REPORT',
            documentDate: doc.documentDate ? new Date(doc.documentDate) : new Date(),
            facility: doc.facility || 'Clinical Lab',
            extractedRawText: doc.extractedRawText || '',
            processingStatus: doc.processingStatus || 'COMPLETED',
            ocrConfidence: doc.ocrConfidence || 95.0,
            flaggedCount: doc.flaggedCount || 0,
            fields: Array.isArray(doc.fields) ? doc.fields : [],
            labs: Array.isArray(doc.labs) ? doc.labs : [],
            medications: Array.isArray(doc.medications) ? doc.medications : [],
            summary: doc.summary || null,
            createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
            updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
          },
        });
        reportsMigrated++;
      } catch (err: any) {
        console.error(`  - Failed to migrate report ${id}: ${err.message}`);
        reportsErrors++;
      }
    }
    stats.push({ collection: 'medicalreports', sourceCount: reportDocs.length, migratedCount: reportsMigrated, skippedCount: reportsSkipped, errorCount: reportsErrors });

    // 3. Migrate Timeline Events
    console.log('▶ [3/9] Migrating Timeline Events...');
    const timelineDocs = await db.collection('timelineevents').find({}).toArray();
    let timelineMigrated = 0;
    let timelineSkipped = 0;
    let timelineErrors = 0;

    for (const doc of timelineDocs) {
      const id = doc._id.toString();
      const userId = doc.userId?.toString();
      const reportId = doc.reportId?.toString() || null;
      try {
        await prisma.timelineEvent.upsert({
          where: { id },
          update: {
            title: doc.title || 'Clinical Event',
            eventDate: doc.eventDate ? new Date(doc.eventDate) : new Date(),
            eventType: doc.eventType || 'LAB_REPORT',
            summaryPreview: doc.summaryPreview || '',
            severityLevel: doc.severityLevel || 'NORMAL',
          },
          create: {
            id,
            userId,
            reportId,
            title: doc.title || 'Clinical Event',
            eventDate: doc.eventDate ? new Date(doc.eventDate) : new Date(),
            eventType: doc.eventType || 'LAB_REPORT',
            summaryPreview: doc.summaryPreview || '',
            severityLevel: doc.severityLevel || 'NORMAL',
            createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
          },
        });
        timelineMigrated++;
      } catch (err: any) {
        console.error(`  - Failed to migrate timeline event ${id}: ${err.message}`);
        timelineErrors++;
      }
    }
    stats.push({ collection: 'timelineevents', sourceCount: timelineDocs.length, migratedCount: timelineMigrated, skippedCount: timelineSkipped, errorCount: timelineErrors });

    // 4. Migrate Medication Alarms
    console.log('▶ [4/9] Migrating Medication Alarms...');
    const alarmDocs = await db.collection('medicationalarms').find({}).toArray();
    let alarmsMigrated = 0;
    let alarmsSkipped = 0;
    let alarmsErrors = 0;

    for (const doc of alarmDocs) {
      const id = doc._id.toString();
      const userId = doc.userId?.toString();
      try {
        await prisma.medicationAlarm.upsert({
          where: { id },
          update: {
            medicineName: doc.medicineName || 'Medicine',
            dosage: doc.dosage || '1 Tablet',
            frequency: doc.frequency || 'TWICE_DAILY',
            timings: Array.isArray(doc.timings) ? doc.timings : ['08:00', '20:00'],
            mealRelation: doc.mealRelation || 'AFTER_MEAL',
            instructions: doc.instructions || '',
            color: doc.color || '#0d9488',
            pillStock: Number(doc.pillStock) || 30,
            lowStockThreshold: Number(doc.lowStockThreshold) || 5,
            active: doc.active !== undefined ? Boolean(doc.active) : true,
            intakeLogs: Array.isArray(doc.intakeLogs) ? doc.intakeLogs : [],
          },
          create: {
            id,
            userId,
            medicineName: doc.medicineName || 'Medicine',
            dosage: doc.dosage || '1 Tablet',
            frequency: doc.frequency || 'TWICE_DAILY',
            timings: Array.isArray(doc.timings) ? doc.timings : ['08:00', '20:00'],
            mealRelation: doc.mealRelation || 'AFTER_MEAL',
            instructions: doc.instructions || '',
            color: doc.color || '#0d9488',
            pillStock: Number(doc.pillStock) || 30,
            lowStockThreshold: Number(doc.lowStockThreshold) || 5,
            active: doc.active !== undefined ? Boolean(doc.active) : true,
            intakeLogs: Array.isArray(doc.intakeLogs) ? doc.intakeLogs : [],
            createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
            updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
          },
        });
        alarmsMigrated++;
      } catch (err: any) {
        console.error(`  - Failed to migrate alarm ${id}: ${err.message}`);
        alarmsErrors++;
      }
    }
    stats.push({ collection: 'medicationalarms', sourceCount: alarmDocs.length, migratedCount: alarmsMigrated, skippedCount: alarmsSkipped, errorCount: alarmsErrors });

    // 5. Migrate Diet Profiles
    console.log('▶ [5/9] Migrating Diet Profiles...');
    const dietDocs = await db.collection('dietprofiles').find({}).toArray();
    let dietMigrated = 0;
    let dietSkipped = 0;
    let dietErrors = 0;

    for (const doc of dietDocs) {
      const id = doc._id.toString();
      const userId = doc.userId?.toString();
      try {
        await prisma.dietProfile.upsert({
          where: { userId },
          update: {
            planName: doc.planName || 'Balanced Wellness Plan',
            planType: doc.planType || 'BALANCED_WELLNESS',
            targetDailyCalories: Number(doc.targetDailyCalories) || 1800,
            dailyWaterTargetGlasses: Number(doc.dailyWaterTargetGlasses) || 8,
            waterLoggedGlasses: Number(doc.waterLoggedGlasses) || 0,
            dietaryRestrictions: Array.isArray(doc.dietaryRestrictions) ? doc.dietaryRestrictions : [],
            meals: Array.isArray(doc.meals) ? doc.meals : [],
            guidelines: Array.isArray(doc.guidelines) ? doc.guidelines : [],
          },
          create: {
            id,
            userId,
            planName: doc.planName || 'Balanced Wellness Plan',
            planType: doc.planType || 'BALANCED_WELLNESS',
            targetDailyCalories: Number(doc.targetDailyCalories) || 1800,
            dailyWaterTargetGlasses: Number(doc.dailyWaterTargetGlasses) || 8,
            waterLoggedGlasses: Number(doc.waterLoggedGlasses) || 0,
            dietaryRestrictions: Array.isArray(doc.dietaryRestrictions) ? doc.dietaryRestrictions : [],
            meals: Array.isArray(doc.meals) ? doc.meals : [],
            guidelines: Array.isArray(doc.guidelines) ? doc.guidelines : [],
            createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
            updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
          },
        });
        dietMigrated++;
      } catch (err: any) {
        console.error(`  - Failed to migrate diet profile ${id}: ${err.message}`);
        dietErrors++;
      }
    }
    stats.push({ collection: 'dietprofiles', sourceCount: dietDocs.length, migratedCount: dietMigrated, skippedCount: dietSkipped, errorCount: dietErrors });

    // 6. Migrate Ambulance Dispatches
    console.log('▶ [6/9] Migrating Ambulance Dispatches...');
    const dispatchDocs = await db.collection('ambulancedispatches').find({}).toArray();
    let dispatchMigrated = 0;
    let dispatchSkipped = 0;
    let dispatchErrors = 0;

    for (const doc of dispatchDocs) {
      const id = doc._id.toString();
      const userId = doc.userId?.toString();
      try {
        await prisma.ambulanceDispatch.upsert({
          where: { id },
          update: {
            patientName: doc.patientName || 'Patient',
            patientPhone: doc.patientPhone || '',
            bloodGroup: doc.bloodGroup || 'O+',
            criticalConditions: Array.isArray(doc.criticalConditions) ? doc.criticalConditions : [],
            allergies: Array.isArray(doc.allergies) ? doc.allergies : [],
            location: doc.location || { address: 'Emergency Location' },
            severity: doc.severity || 'CRITICAL',
            ambulanceType: doc.ambulanceType || 'ADVANCED_CARDIAC_ICU',
            status: doc.status || 'DISPATCHED',
            hospitalDestination: doc.hospitalDestination || 'Hospital',
            ambulanceDetails: doc.ambulanceDetails || {},
            emergencyContactsNotified: doc.emergencyContactsNotified !== undefined ? Boolean(doc.emergencyContactsNotified) : true,
            notes: doc.notes || '',
          },
          create: {
            id,
            userId,
            patientName: doc.patientName || 'Patient',
            patientPhone: doc.patientPhone || '',
            bloodGroup: doc.bloodGroup || 'O+',
            criticalConditions: Array.isArray(doc.criticalConditions) ? doc.criticalConditions : [],
            allergies: Array.isArray(doc.allergies) ? doc.allergies : [],
            location: doc.location || { address: 'Emergency Location' },
            severity: doc.severity || 'CRITICAL',
            ambulanceType: doc.ambulanceType || 'ADVANCED_CARDIAC_ICU',
            status: doc.status || 'DISPATCHED',
            hospitalDestination: doc.hospitalDestination || 'Hospital',
            ambulanceDetails: doc.ambulanceDetails || {},
            emergencyContactsNotified: doc.emergencyContactsNotified !== undefined ? Boolean(doc.emergencyContactsNotified) : true,
            notes: doc.notes || '',
            createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
            updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
          },
        });
        dispatchMigrated++;
      } catch (err: any) {
        console.error(`  - Failed to migrate dispatch ${id}: ${err.message}`);
        dispatchErrors++;
      }
    }
    stats.push({ collection: 'ambulancedispatches', sourceCount: dispatchDocs.length, migratedCount: dispatchMigrated, skippedCount: dispatchSkipped, errorCount: dispatchErrors });

    // 7. Migrate Appointments
    console.log('▶ [7/9] Migrating Appointments...');
    const apptDocs = await db.collection('appointments').find({}).toArray();
    let apptMigrated = 0;
    let apptSkipped = 0;
    let apptErrors = 0;

    for (const doc of apptDocs) {
      const id = doc._id.toString();
      const userId = doc.userId?.toString();
      try {
        await prisma.appointment.upsert({
          where: { id },
          update: {
            doctorName: doc.doctorName || 'Doctor',
            specialty: doc.specialty || 'General Medicine',
            clinicName: doc.clinicName || 'Clinic',
            date: doc.date || '',
            time: doc.time || '',
            type: doc.type || 'FOLLOW_UP',
            status: doc.status || 'UPCOMING',
            reasonForVisit: doc.reasonForVisit || 'Consultation',
            doctorNotes: doc.doctorNotes || '',
            nextFollowUpDays: doc.nextFollowUpDays ? Number(doc.nextFollowUpDays) : null,
            reminderSet: doc.reminderSet !== undefined ? Boolean(doc.reminderSet) : true,
            location: doc.location || '',
            contactPhone: doc.contactPhone || '',
          },
          create: {
            id,
            userId,
            doctorName: doc.doctorName || 'Doctor',
            specialty: doc.specialty || 'General Medicine',
            clinicName: doc.clinicName || 'Clinic',
            date: doc.date || '',
            time: doc.time || '',
            type: doc.type || 'FOLLOW_UP',
            status: doc.status || 'UPCOMING',
            reasonForVisit: doc.reasonForVisit || 'Consultation',
            doctorNotes: doc.doctorNotes || '',
            nextFollowUpDays: doc.nextFollowUpDays ? Number(doc.nextFollowUpDays) : null,
            reminderSet: doc.reminderSet !== undefined ? Boolean(doc.reminderSet) : true,
            location: doc.location || '',
            contactPhone: doc.contactPhone || '',
            createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
            updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
          },
        });
        apptMigrated++;
      } catch (err: any) {
        console.error(`  - Failed to migrate appointment ${id}: ${err.message}`);
        apptErrors++;
      }
    }
    stats.push({ collection: 'appointments', sourceCount: apptDocs.length, migratedCount: apptMigrated, skippedCount: apptSkipped, errorCount: apptErrors });

    // 8. Migrate First Aid Guides
    console.log('▶ [8/9] Migrating First Aid Guides...');
    const firstAidDocs = await db.collection('firstaidguides').find({}).toArray();
    let firstAidMigrated = 0;
    let firstAidSkipped = 0;
    let firstAidErrors = 0;

    for (const doc of firstAidDocs) {
      const slug = doc.slug;
      const id = doc._id.toString();
      try {
        await prisma.firstAidGuide.upsert({
          where: { slug },
          update: {
            title: doc.title,
            category: doc.category || 'TRAUMA',
            severity: doc.severity || 'URGENT',
            summary: doc.summary || '',
            symptoms: Array.isArray(doc.symptoms) ? doc.symptoms : [],
            steps: Array.isArray(doc.steps) ? doc.steps : [],
            dos: Array.isArray(doc.dos) ? doc.dos : [],
            donts: Array.isArray(doc.donts) ? doc.donts : [],
            cprCadenceBpm: doc.cprCadenceBpm ? Number(doc.cprCadenceBpm) : null,
            callEmergencyImmediately: Boolean(doc.callEmergencyImmediately),
          },
          create: {
            id,
            slug,
            title: doc.title,
            category: doc.category || 'TRAUMA',
            severity: doc.severity || 'URGENT',
            summary: doc.summary || '',
            symptoms: Array.isArray(doc.symptoms) ? doc.symptoms : [],
            steps: Array.isArray(doc.steps) ? doc.steps : [],
            dos: Array.isArray(doc.dos) ? doc.dos : [],
            donts: Array.isArray(doc.donts) ? doc.donts : [],
            cprCadenceBpm: doc.cprCadenceBpm ? Number(doc.cprCadenceBpm) : null,
            callEmergencyImmediately: Boolean(doc.callEmergencyImmediately),
            createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
            updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
          },
        });
        firstAidMigrated++;
      } catch (err: any) {
        console.error(`  - Failed to migrate first aid guide ${slug}: ${err.message}`);
        firstAidErrors++;
      }
    }
    stats.push({ collection: 'firstaidguides', sourceCount: firstAidDocs.length, migratedCount: firstAidMigrated, skippedCount: firstAidSkipped, errorCount: firstAidErrors });

    // 9. Migrate Notifications
    console.log('▶ [9/9] Migrating Notifications...');
    const notifDocs = await db.collection('notifications').find({}).toArray();
    let notifsMigrated = 0;
    let notifsSkipped = 0;
    let notifsErrors = 0;

    for (const doc of notifDocs) {
      const id = doc._id.toString();
      const userId = doc.userId?.toString();
      try {
        await prisma.notification.upsert({
          where: { id },
          update: {
            title: doc.title || 'Notification',
            message: doc.message || '',
            type: doc.type || 'SYSTEM',
            priority: doc.priority || 'NORMAL',
            read: Boolean(doc.read),
            actionUrl: doc.actionUrl || '',
            metadata: doc.metadata || null,
          },
          create: {
            id,
            userId,
            title: doc.title || 'Notification',
            message: doc.message || '',
            type: doc.type || 'SYSTEM',
            priority: doc.priority || 'NORMAL',
            read: Boolean(doc.read),
            actionUrl: doc.actionUrl || '',
            metadata: doc.metadata || null,
            createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
            updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
          },
        });
        notifsMigrated++;
      } catch (err: any) {
        console.error(`  - Failed to migrate notification ${id}: ${err.message}`);
        notifsErrors++;
      }
    }
    stats.push({ collection: 'notifications', sourceCount: notifDocs.length, migratedCount: notifsMigrated, skippedCount: notifsSkipped, errorCount: notifsErrors });

    // Verification & Summary
    console.log('\n=================================================================');
    console.log('                   MIGRATION EXECUTION SUMMARY                   ');
    console.log('=================================================================');
    console.table(stats);

    console.log('\nDestination PostgreSQL Live Counts:');
    const [uCount, rCount, tCount, aCount, dCount, ambCount, appCount, faCount, nCount] = await Promise.all([
      prisma.user.count(),
      prisma.medicalReport.count(),
      prisma.timelineEvent.count(),
      prisma.medicationAlarm.count(),
      prisma.dietProfile.count(),
      prisma.ambulanceDispatch.count(),
      prisma.appointment.count(),
      prisma.firstAidGuide.count(),
      prisma.notification.count(),
    ]);

    console.log(` - users:               ${uCount}`);
    console.log(` - medical_reports:     ${rCount}`);
    console.log(` - timeline_events:     ${tCount}`);
    console.log(` - medication_alarms:   ${aCount}`);
    console.log(` - diet_profiles:       ${dCount}`);
    console.log(` - ambulance_dispatches:${ambCount}`);
    console.log(` - appointments:        ${appCount}`);
    console.log(` - first_aid_guides:    ${faCount}`);
    console.log(` - notifications:       ${nCount}`);
    console.log('=================================================================\n');

  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('Migration process finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal migration error:', err);
      process.exit(1);
    });
}
