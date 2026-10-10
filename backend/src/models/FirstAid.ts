import mongoose, { Document, Schema } from 'mongoose';

export interface IFirstAidGuide extends Document {
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
  cprCadenceBpm?: number; // 100-120 BPM for CPR
  callEmergencyImmediately: boolean;
  createdAt: Date;
}

const FirstAidGuideSchema = new Schema<IFirstAidGuide>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['CARDIAC', 'TRAUMA', 'RESPIRATORY', 'POISONING', 'ENVIRONMENTAL', 'PEDIATRIC'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['CRITICAL_CALL_AMBULANCE', 'URGENT', 'STANDARD'],
      default: 'URGENT',
    },
    summary: { type: String, required: true },
    symptoms: { type: [String], default: [] },
    steps: [
      {
        stepNumber: { type: Number, required: true },
        instruction: { type: String, required: true },
        detail: { type: String, required: true },
        warning: { type: String },
      },
    ],
    dos: { type: [String], default: [] },
    donts: { type: [String], default: [] },
    cprCadenceBpm: { type: Number },
    callEmergencyImmediately: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const FirstAidGuideModel =
  mongoose.models.FirstAidGuide || mongoose.model<IFirstAidGuide>('FirstAidGuide', FirstAidGuideSchema);
