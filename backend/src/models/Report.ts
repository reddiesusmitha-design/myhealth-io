import mongoose, { Document, Schema } from 'mongoose';

export interface IMedicalReportDoc extends Document {
  userId: string;
  originalFilename: string;
  filePath: string;
  mimeType: string;
  fileSizeBytes: number;
  documentType: 'LAB_REPORT' | 'PRESCRIPTION' | 'DISCHARGE_SUMMARY';
  documentDate: Date;
  facility: string;
  extractedRawText?: string;
  processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  ocrConfidence?: number;
  flaggedCount: number;
  fields?: Array<{
    fieldCategory: string;
    fieldKey: string;
    fieldValue: string;
    confidenceScore: number;
    sourceSnippet: string;
  }>;
  labs?: Array<{
    testName: string;
    valueNumeric?: number;
    valueString?: string;
    unit?: string;
    referenceLow?: number;
    referenceHigh?: number;
    interpretation?: string;
  }>;
  medications?: Array<{
    medicationName: string;
    dosage?: string;
    frequency?: string;
    instructions?: string;
  }>;
  summary?: {
    summaryEn: string;
    summaryTe?: string;
    keyFindings: Array<{ item: string; explanation: string; status: string }>;
    disclaimerText: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MedicalReportSchema = new Schema<IMedicalReportDoc>(
  {
    userId: { type: String, required: true, index: true },
    originalFilename: { type: String, required: true },
    filePath: { type: String, default: '' },
    mimeType: { type: String, default: 'application/pdf' },
    fileSizeBytes: { type: Number, default: 0 },
    documentType: {
      type: String,
      enum: ['LAB_REPORT', 'PRESCRIPTION', 'DISCHARGE_SUMMARY'],
      default: 'LAB_REPORT',
    },
    documentDate: { type: Date, default: Date.now },
    facility: { type: String, default: 'Clinical Lab' },
    extractedRawText: { type: String },
    processingStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'COMPLETED',
    },
    ocrConfidence: { type: Number, default: 95.0 },
    flaggedCount: { type: Number, default: 0 },
    fields: { type: [Schema.Types.Mixed], default: [] },
    labs: { type: [Schema.Types.Mixed], default: [] },
    medications: { type: [Schema.Types.Mixed], default: [] },
    summary: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const ReportModel =
  mongoose.models.MedicalReport ||
  mongoose.model<IMedicalReportDoc>('MedicalReport', MedicalReportSchema);
