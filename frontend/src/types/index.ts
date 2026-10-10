export interface User {
  id: string;
  email: string;
  fullName: string;
  mockAbhaId?: string;
  preferredLanguage?: 'en' | 'te';
}

export interface ExtractedField {
  id: string;
  documentId: string;
  fieldCategory: 'LAB_RESULT' | 'MEDICATION' | 'DIAGNOSIS' | 'VITAL';
  fieldKey: string;
  fieldValue: string;
  confidenceScore: number;
  isUncertain: boolean;
  uncertaintyReason?: string;
  sourceSnippet: string;
  isUserReviewed: boolean;
  userOverrideValue?: string;
}

export interface LabObservation {
  id: string;
  testName: string;
  valueNumeric?: number;
  valueString?: string;
  unit?: string;
  referenceLow?: number;
  referenceHigh?: number;
  referenceText?: string;
  interpretation?: 'NORMAL' | 'HIGH' | 'LOW' | 'UNCERTAIN';
  observationDate?: string;
  sourceSnippet?: string;
}

export interface MedicationRecord {
  id: string;
  medicationName: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  route?: string;
  instructions?: string;
  sourceSnippet?: string;
}

export interface HealthSummary {
  id: string;
  documentId: string;
  summaryEn: string;
  summaryTe?: string;
  keyFindings: Array<{
    item: string;
    explanation: string;
    status: 'NORMAL' | 'ATTENTION' | 'UNCERTAIN';
    sourceSnippet?: string;
  }>;
  aiProvider: 'gemini' | 'openai' | 'template';
  disclaimerText: string;
}

export interface MedicalReport {
  id: string;
  userId: string;
  originalFilename: string;
  documentType: 'LAB_REPORT' | 'PRESCRIPTION' | 'DISCHARGE_SUMMARY';
  documentDate?: string;
  extractedRawText?: string;
  processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  ocrConfidence?: number;
  createdAt: string;
  fields?: ExtractedField[];
  labs?: LabObservation[];
  medications?: MedicationRecord[];
  summary?: HealthSummary;
}

export interface TimelineEvent {
  id: string;
  eventDate: string;
  eventType: 'LAB_REPORT' | 'PRESCRIPTION' | 'CLINICAL_VISIT' | 'IMMUNIZATION';
  title: string;
  summaryPreview?: string;
  severityLevel: 'INFO' | 'ATTENTION' | 'NORMAL';
}

export interface UserNotification {
  _id?: string;
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'MEDICATION' | 'APPOINTMENT' | 'EMERGENCY' | 'LAB_RESULT' | 'SYSTEM' | 'DIET';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface MedicationAlarm {
  _id?: string;
  id: string;
  userId?: string;
  medicineName: string;
  dosage: string;
  frequency: 'ONCE_DAILY' | 'TWICE_DAILY' | 'THRICE_DAILY' | 'CUSTOM';
  timings: string[];
  mealRelation: 'BEFORE_MEAL' | 'AFTER_MEAL' | 'WITH_MEAL' | 'ANYTIME';
  instructions?: string;
  color?: string;
  pillStock: number;
  lowStockThreshold: number;
  active: boolean;
  intakeLogs?: Array<{
    date: string;
    time: string;
    status: 'TAKEN' | 'SKIPPED' | 'SNOOZED';
    takenAt?: string;
  }>;
}

export interface MealItem {
  name: string;
  portion: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  notes?: string;
}

export interface DayMealPlan {
  mealType: 'BREAKFAST' | 'MID_MORNING' | 'LUNCH' | 'EVENING_SNACK' | 'DINNER' | 'BEDTIME';
  scheduledTime: string;
  items: MealItem[];
  tips: string;
}

export interface DietProfile {
  _id?: string;
  id?: string;
  planName: string;
  planType: 'DIABETIC_SAFE' | 'CARDIAC_CARE' | 'HYPERTENSION_DASH' | 'HIGH_PROTEIN' | 'BALANCED_WELLNESS';
  targetDailyCalories: number;
  dailyWaterTargetGlasses: number;
  waterLoggedGlasses: number;
  dietaryRestrictions: string[];
  meals: DayMealPlan[];
  guidelines: string[];
}

export interface AmbulanceDispatch {
  _id?: string;
  id: string;
  patientName: string;
  patientPhone: string;
  bloodGroup: string;
  criticalConditions: string[];
  allergies: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
    landmark?: string;
  };
  severity: 'CRITICAL' | 'URGENT' | 'STANDARD';
  ambulanceType: 'ADVANCED_CARDIAC_ICU' | 'BASIC_LIFE_SUPPORT' | 'GENERAL_TRANSPORT';
  status: 'REQUESTED' | 'DISPATCHED' | 'EN_ROUTE' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED';
  hospitalDestination: string;
  ambulanceDetails: {
    providerName: string;
    vehicleNumber: string;
    driverName: string;
    driverPhone: string;
    etaMinutes: number;
  };
  emergencyContactsNotified: boolean;
  notes?: string;
  createdAt: string;
}

export interface Appointment {
  _id?: string;
  id: string;
  doctorName: string;
  specialty: string;
  clinicName: string;
  date: string;
  time: string;
  type: 'FOLLOW_UP' | 'NEW_CONSULTATION' | 'ROUTINE_CHECKUP' | 'TELECONSULT';
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  reasonForVisit: string;
  doctorNotes?: string;
  nextFollowUpDays?: number;
  reminderSet: boolean;
  location: string;
  contactPhone?: string;
}

export interface FirstAidGuide {
  slug: string;
  title: string;
  category: 'CARDIAC' | 'TRAUMA' | 'RESPIRATORY' | 'POISONING' | 'ENVIRONMENTAL' | 'PEDIATRIC';
  severity: 'CRITICAL_CALL_AMBULANCE' | 'URGENT' | 'STANDARD';
  summary: string;
  symptoms: string[];
  steps: Array<{
    stepNumber: number;
    instruction: string;
    detail: string;
    warning?: string;
  }>;
  dos: string[];
  donts: string[];
  cprCadenceBpm?: number;
  callEmergencyImmediately: boolean;
}

