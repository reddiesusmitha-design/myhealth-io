import mongoose, { Document, Schema } from 'mongoose';

export interface IAmbulanceDispatch extends Document {
  userId: string;
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
  createdAt: Date;
  updatedAt: Date;
}

const AmbulanceDispatchSchema = new Schema<IAmbulanceDispatch>(
  {
    userId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    patientPhone: { type: String, required: true },
    bloodGroup: { type: String, default: 'O+' },
    criticalConditions: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    location: {
      latitude: { type: Number, default: 17.385 },
      longitude: { type: Number, default: 78.4867 },
      address: { type: String, required: true },
      landmark: { type: String },
    },
    severity: {
      type: String,
      enum: ['CRITICAL', 'URGENT', 'STANDARD'],
      default: 'CRITICAL',
    },
    ambulanceType: {
      type: String,
      enum: ['ADVANCED_CARDIAC_ICU', 'BASIC_LIFE_SUPPORT', 'GENERAL_TRANSPORT'],
      default: 'ADVANCED_CARDIAC_ICU',
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED', 'CANCELLED'],
      default: 'DISPATCHED',
    },
    hospitalDestination: { type: String, default: 'Apollo Emergency Medical Centre' },
    ambulanceDetails: {
      providerName: { type: String, default: '108 EMRI Emergency Response' },
      vehicleNumber: { type: String, default: 'TS-09-EM-1088' },
      driverName: { type: String, default: 'Rajesh Kumar (Paramedic Team A)' },
      driverPhone: { type: String, default: '+91 98490 10811' },
      etaMinutes: { type: Number, default: 6 },
    },
    emergencyContactsNotified: { type: Boolean, default: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const AmbulanceDispatchModel =
  mongoose.models.AmbulanceDispatch ||
  mongoose.model<IAmbulanceDispatch>('AmbulanceDispatch', AmbulanceDispatchSchema);
