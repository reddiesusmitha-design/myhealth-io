import mongoose, { Document, Schema } from 'mongoose';

export interface IIntakeLog {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'TAKEN' | 'SKIPPED' | 'SNOOZED';
  takenAt?: Date;
}

export interface IMedicationAlarm extends Document {
  userId: string;
  medicineName: string;
  dosage: string;
  frequency: 'ONCE_DAILY' | 'TWICE_DAILY' | 'THRICE_DAILY' | 'CUSTOM';
  timings: string[]; // ["08:00", "13:00", "20:30"]
  mealRelation: 'BEFORE_MEAL' | 'AFTER_MEAL' | 'WITH_MEAL' | 'ANYTIME';
  instructions?: string;
  color?: string;
  pillStock: number;
  lowStockThreshold: number;
  active: boolean;
  intakeLogs: IIntakeLog[];
  createdAt: Date;
  updatedAt: Date;
}

const IntakeLogSchema = new Schema<IIntakeLog>(
  {
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ['TAKEN', 'SKIPPED', 'SNOOZED'], required: true },
    takenAt: { type: Date },
  },
  { _id: false }
);

const MedicationAlarmSchema = new Schema<IMedicationAlarm>(
  {
    userId: { type: String, required: true, index: true },
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true, default: '1 Tablet' },
    frequency: {
      type: String,
      enum: ['ONCE_DAILY', 'TWICE_DAILY', 'THRICE_DAILY', 'CUSTOM'],
      default: 'TWICE_DAILY',
    },
    timings: { type: [String], default: ['08:00', '20:00'] },
    mealRelation: {
      type: String,
      enum: ['BEFORE_MEAL', 'AFTER_MEAL', 'WITH_MEAL', 'ANYTIME'],
      default: 'AFTER_MEAL',
    },
    instructions: { type: String, default: '' },
    color: { type: String, default: '#0d9488' }, // teal
    pillStock: { type: Number, default: 30 },
    lowStockThreshold: { type: Number, default: 5 },
    active: { type: Boolean, default: true },
    intakeLogs: [IntakeLogSchema],
  },
  { timestamps: true }
);

export const MedicationAlarmModel =
  mongoose.models.MedicationAlarm ||
  mongoose.model<IMedicationAlarm>('MedicationAlarm', MedicationAlarmSchema);
