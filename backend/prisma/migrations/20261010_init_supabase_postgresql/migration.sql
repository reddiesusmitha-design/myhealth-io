-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "mockAbhaId" TEXT NOT NULL,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "bloodGroup" TEXT NOT NULL DEFAULT 'O+',
    "emergencyContact" TEXT DEFAULT '',
    "allergies" JSONB NOT NULL DEFAULT '[]',
    "chronicConditions" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT '',
    "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
    "fileSizeBytes" BIGINT NOT NULL DEFAULT 0,
    "documentType" TEXT NOT NULL DEFAULT 'LAB_REPORT',
    "documentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "facility" TEXT NOT NULL DEFAULT 'Clinical Lab',
    "extractedRawText" TEXT,
    "processingStatus" TEXT NOT NULL DEFAULT 'COMPLETED',
    "ocrConfidence" DOUBLE PRECISION DEFAULT 95.0,
    "flaggedCount" INTEGER NOT NULL DEFAULT 0,
    "fields" JSONB NOT NULL DEFAULT '[]',
    "labs" JSONB NOT NULL DEFAULT '[]',
    "medications" JSONB NOT NULL DEFAULT '[]',
    "summary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportId" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventType" TEXT NOT NULL DEFAULT 'LAB_REPORT',
    "title" TEXT NOT NULL,
    "summaryPreview" TEXT,
    "severityLevel" TEXT NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_alarms" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "medicineName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL DEFAULT '1 Tablet',
    "frequency" TEXT NOT NULL DEFAULT 'TWICE_DAILY',
    "timings" JSONB NOT NULL DEFAULT '["08:00", "20:00"]',
    "mealRelation" TEXT NOT NULL DEFAULT 'AFTER_MEAL',
    "instructions" TEXT DEFAULT '',
    "color" TEXT DEFAULT '#0d9488',
    "pillStock" INTEGER NOT NULL DEFAULT 30,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "intakeLogs" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medication_alarms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diet_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "planType" TEXT NOT NULL DEFAULT 'BALANCED_WELLNESS',
    "targetDailyCalories" INTEGER NOT NULL DEFAULT 1800,
    "dailyWaterTargetGlasses" INTEGER NOT NULL DEFAULT 8,
    "waterLoggedGlasses" INTEGER NOT NULL DEFAULT 0,
    "dietaryRestrictions" JSONB NOT NULL DEFAULT '[]',
    "meals" JSONB NOT NULL DEFAULT '[]',
    "guidelines" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diet_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ambulance_dispatches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "patientPhone" TEXT NOT NULL,
    "bloodGroup" TEXT NOT NULL DEFAULT 'O+',
    "criticalConditions" JSONB NOT NULL DEFAULT '[]',
    "allergies" JSONB NOT NULL DEFAULT '[]',
    "location" JSONB NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'CRITICAL',
    "ambulanceType" TEXT NOT NULL DEFAULT 'ADVANCED_CARDIAC_ICU',
    "status" TEXT NOT NULL DEFAULT 'DISPATCHED',
    "hospitalDestination" TEXT NOT NULL DEFAULT 'Apollo Emergency Medical Centre',
    "ambulanceDetails" JSONB NOT NULL,
    "emergencyContactsNotified" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ambulance_dispatches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "doctorName" TEXT NOT NULL,
    "specialty" TEXT NOT NULL DEFAULT 'General Medicine',
    "clinicName" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'FOLLOW_UP',
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "reasonForVisit" TEXT NOT NULL,
    "doctorNotes" TEXT DEFAULT '',
    "nextFollowUpDays" INTEGER,
    "reminderSet" BOOLEAN NOT NULL DEFAULT true,
    "location" TEXT NOT NULL DEFAULT 'Main Consultation Wing, Room 204',
    "contactPhone" TEXT DEFAULT '+91 40 2345 6789',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "first_aid_guides" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'URGENT',
    "summary" TEXT NOT NULL,
    "symptoms" JSONB NOT NULL DEFAULT '[]',
    "steps" JSONB NOT NULL DEFAULT '[]',
    "dos" JSONB NOT NULL DEFAULT '[]',
    "donts" JSONB NOT NULL DEFAULT '[]',
    "cprCadenceBpm" INTEGER,
    "callEmergencyImmediately" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "first_aid_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SYSTEM',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT DEFAULT '',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_mockAbhaId_key" ON "users"("mockAbhaId");

-- CreateIndex
CREATE INDEX "medical_reports_userId_idx" ON "medical_reports"("userId");

-- CreateIndex
CREATE INDEX "timeline_events_userId_eventDate_idx" ON "timeline_events"("userId", "eventDate");

-- CreateIndex
CREATE INDEX "medication_alarms_userId_idx" ON "medication_alarms"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "diet_profiles_userId_key" ON "diet_profiles"("userId");

-- CreateIndex
CREATE INDEX "ambulance_dispatches_userId_idx" ON "ambulance_dispatches"("userId");

-- CreateIndex
CREATE INDEX "appointments_userId_idx" ON "appointments"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "first_aid_guides_slug_key" ON "first_aid_guides"("slug");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- AddForeignKey
ALTER TABLE "medical_reports" ADD CONSTRAINT "medical_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "medical_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_alarms" ADD CONSTRAINT "medication_alarms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diet_profiles" ADD CONSTRAINT "diet_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ambulance_dispatches" ADD CONSTRAINT "ambulance_dispatches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
