import mongoose, { Document, Schema } from 'mongoose';

export interface ITimelineEventDoc extends Document {
  userId: string;
  reportId?: string;
  eventDate: Date;
  eventType: 'LAB_REPORT' | 'PRESCRIPTION' | 'CLINICAL_VISIT' | 'IMMUNIZATION';
  title: string;
  summaryPreview?: string;
  severityLevel: 'INFO' | 'ATTENTION' | 'NORMAL';
  createdAt: Date;
}

const TimelineEventSchema = new Schema<ITimelineEventDoc>(
  {
    userId: { type: String, required: true, index: true },
    reportId: { type: String },
    eventDate: { type: Date, default: Date.now },
    eventType: {
      type: String,
      enum: ['LAB_REPORT', 'PRESCRIPTION', 'CLINICAL_VISIT', 'IMMUNIZATION'],
      default: 'LAB_REPORT',
    },
    title: { type: String, required: true },
    summaryPreview: { type: String },
    severityLevel: {
      type: String,
      enum: ['INFO', 'ATTENTION', 'NORMAL'],
      default: 'NORMAL',
    },
  },
  { timestamps: true }
);

export const TimelineModel =
  mongoose.models.TimelineEvent ||
  mongoose.model<ITimelineEventDoc>('TimelineEvent', TimelineEventSchema);
