import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  userId: string;
  doctorName: string;
  specialty: string;
  clinicName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: 'FOLLOW_UP' | 'NEW_CONSULTATION' | 'ROUTINE_CHECKUP' | 'TELECONSULT';
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  reasonForVisit: string;
  doctorNotes?: string;
  nextFollowUpDays?: number;
  reminderSet: boolean;
  location: string;
  contactPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    userId: { type: String, required: true, index: true },
    doctorName: { type: String, required: true },
    specialty: { type: String, required: true, default: 'General Medicine' },
    clinicName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    type: {
      type: String,
      enum: ['FOLLOW_UP', 'NEW_CONSULTATION', 'ROUTINE_CHECKUP', 'TELECONSULT'],
      default: 'FOLLOW_UP',
    },
    status: {
      type: String,
      enum: ['UPCOMING', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'],
      default: 'UPCOMING',
    },
    reasonForVisit: { type: String, required: true },
    doctorNotes: { type: String, default: '' },
    nextFollowUpDays: { type: Number },
    reminderSet: { type: Boolean, default: true },
    location: { type: String, default: 'Main Consultation Wing, Room 204' },
    contactPhone: { type: String, default: '+91 40 2345 6789' },
  },
  { timestamps: true }
);

export const AppointmentModel =
  mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
