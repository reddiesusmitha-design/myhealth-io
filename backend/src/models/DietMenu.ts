import mongoose, { Document, Schema } from 'mongoose';

export interface IMealItem {
  name: string;
  portion: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  notes?: string;
}

export interface IDayMealPlan {
  mealType: 'BREAKFAST' | 'MID_MORNING' | 'LUNCH' | 'EVENING_SNACK' | 'DINNER' | 'BEDTIME';
  scheduledTime: string; // e.g. "08:30"
  items: IMealItem[];
  tips: string;
}

export interface IDietProfile extends Document {
  userId: string;
  planName: string; // e.g. "Heart-Healthy & Diabetic Care Plan"
  planType: 'DIABETIC_SAFE' | 'CARDIAC_CARE' | 'HYPERTENSION_DASH' | 'HIGH_PROTEIN' | 'BALANCED_WELLNESS';
  targetDailyCalories: number;
  dailyWaterTargetGlasses: number;
  waterLoggedGlasses: number;
  dietaryRestrictions: string[]; // e.g. ["Low Sodium", "Low Sugar", "Vegetarian"]
  meals: IDayMealPlan[];
  guidelines: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MealItemSchema = new Schema<IMealItem>(
  {
    name: { type: String, required: true },
    portion: { type: String, required: true },
    calories: { type: Number, required: true },
    proteinGrams: { type: Number, default: 0 },
    carbsGrams: { type: Number, default: 0 },
    fatsGrams: { type: Number, default: 0 },
    notes: { type: String },
  },
  { _id: false }
);

const DayMealPlanSchema = new Schema<IDayMealPlan>(
  {
    mealType: {
      type: String,
      enum: ['BREAKFAST', 'MID_MORNING', 'LUNCH', 'EVENING_SNACK', 'DINNER', 'BEDTIME'],
      required: true,
    },
    scheduledTime: { type: String, required: true },
    items: [MealItemSchema],
    tips: { type: String, default: '' },
  },
  { _id: false }
);

const DietProfileSchema = new Schema<IDietProfile>(
  {
    userId: { type: String, required: true, index: true },
    planName: { type: String, required: true },
    planType: {
      type: String,
      enum: ['DIABETIC_SAFE', 'CARDIAC_CARE', 'HYPERTENSION_DASH', 'HIGH_PROTEIN', 'BALANCED_WELLNESS'],
      default: 'BALANCED_WELLNESS',
    },
    targetDailyCalories: { type: Number, default: 1800 },
    dailyWaterTargetGlasses: { type: Number, default: 8 },
    waterLoggedGlasses: { type: Number, default: 0 },
    dietaryRestrictions: { type: [String], default: [] },
    meals: [DayMealPlanSchema],
    guidelines: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const DietProfileModel =
  mongoose.models.DietProfile || mongoose.model<IDietProfile>('DietProfile', DietProfileSchema);
