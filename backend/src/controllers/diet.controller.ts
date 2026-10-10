import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { DietProfileModel } from '../models/DietMenu';
import { isDatabaseConnected } from '../config/database';

const DEFAULT_DIET_PLAN = {
  planName: 'Diabetic & Cardiac Balanced Wellness Plan',
  planType: 'DIABETIC_SAFE',
  targetDailyCalories: 1750,
  dailyWaterTargetGlasses: 8,
  waterLoggedGlasses: 0,
  dietaryRestrictions: ['Low Glycemic', 'Low Sodium (< 2g/day)', 'Zero Refined Sugar'],
  guidelines: [
    'Prioritize high-fiber complex grains (Ragi, Oats, Brown Rice, Millets) over polished white rice.',
    'Consume green leafy vegetables and salads prior to main carbohydrate courses to buffer blood glucose spike.',
    'Restrict saturated oils; use cold-pressed mustard, olive or groundnut oil in moderation (<3 tsp/day).',
    'Stay hydrated with at least 2 to 2.5 Litres of water spaced evenly throughout daylight hours.',
  ],
  meals: [
    {
      mealType: 'BREAKFAST',
      scheduledTime: '08:00',
      tips: 'Take after morning Metformin. Low-GI start to prevent morning glucose surge.',
      items: [
        {
          name: 'Steamed Ragi Idli (2 pcs) + Methi Sambar',
          portion: '2 Idlis + 1 Bowl Sambar',
          calories: 260,
          proteinGrams: 8,
          carbsGrams: 42,
          fatsGrams: 3,
          notes: 'High in calcium & fiber; slow glucose release',
        },
        {
          name: 'Boiled Egg Whites / Sprouted Moong Salad',
          portion: '2 Whites or 50g Sprouts',
          calories: 75,
          proteinGrams: 9,
          carbsGrams: 4,
          fatsGrams: 0.5,
          notes: 'Lean protein source',
        },
        {
          name: 'Green Tea or Cinnamon Herbal Infusion',
          portion: '1 Cup (150 ml)',
          calories: 5,
          proteinGrams: 0,
          carbsGrams: 1,
          fatsGrams: 0,
          notes: 'No added sugar',
        },
      ],
    },
    {
      mealType: 'MID_MORNING',
      scheduledTime: '11:00',
      tips: 'Controls midday insulin dips and curbs hunger pangs.',
      items: [
        {
          name: 'Handful of Soaked Almonds & Walnuts',
          portion: '6 Almonds + 2 Walnuts',
          calories: 120,
          proteinGrams: 4,
          carbsGrams: 3,
          fatsGrams: 11,
          notes: 'Rich in Heart-healthy Omega-3 fatty acids',
        },
        {
          name: 'Fresh Guava or Green Apple Slices',
          portion: '1 Small Fruit (100g)',
          calories: 60,
          proteinGrams: 1,
          carbsGrams: 14,
          fatsGrams: 0.3,
          notes: 'Pectin fiber & Vitamin C',
        },
      ],
    },
    {
      mealType: 'LUNCH',
      scheduledTime: '13:30',
      tips: 'Follow the Plate Method: 50% Vegetables, 25% Lean Protein, 25% Complex Grains.',
      items: [
        {
          name: 'Multigrain Phulka (2 pcs) or Brown Rice',
          portion: '2 Rotis (approx 60g)',
          calories: 180,
          proteinGrams: 6,
          carbsGrams: 36,
          fatsGrams: 2,
          notes: 'Whole wheat + jowar blend',
        },
        {
          name: 'Palak Dal / Tadka Yellow Dal',
          portion: '1 Medium Bowl (150g)',
          calories: 145,
          proteinGrams: 9,
          carbsGrams: 20,
          fatsGrams: 3,
          notes: 'Rich in iron, plant proteins',
        },
        {
          name: 'Bhindi / Kundru (Ivy Gourd) Stir Fry',
          portion: '1 Cup (100g)',
          calories: 85,
          proteinGrams: 2,
          carbsGrams: 10,
          fatsGrams: 4,
          notes: 'Low glycemic index',
        },
        {
          name: 'Probiotic Curd / Chaas (Spiced Buttermilk)',
          portion: '1 Glass (150 ml)',
          calories: 55,
          proteinGrams: 4,
          carbsGrams: 5,
          fatsGrams: 1.5,
          notes: 'Aids gut microbiome & digestion',
        },
      ],
    },
    {
      mealType: 'EVENING_SNACK',
      scheduledTime: '17:00',
      tips: 'Healthy crunch without sodium spike. Avoid packaged fried snacks.',
      items: [
        {
          name: 'Roasted Makhana (Fox Nuts) with Turmeric',
          portion: '1 Small Bowl (30g)',
          calories: 105,
          proteinGrams: 3,
          carbsGrams: 20,
          fatsGrams: 1,
          notes: 'Zero trans fat, anti-inflammatory curcumin',
        },
        {
          name: 'Thin Lemon Ginger Warm Water',
          portion: '1 Mug',
          calories: 10,
          proteinGrams: 0,
          carbsGrams: 2,
          fatsGrams: 0,
          notes: 'Hydrating & immune support',
        },
      ],
    },
    {
      mealType: 'DINNER',
      scheduledTime: '20:00',
      tips: 'Light dinner at least 2 hours before bedtime for optimal metabolic resting.',
      items: [
        {
          name: 'Grilled Vegetable & Paneer Skewer / Chicken Tikka',
          portion: '1 Plate (120g)',
          calories: 210,
          proteinGrams: 16,
          carbsGrams: 8,
          fatsGrams: 11,
          notes: 'High satiety protein',
        },
        {
          name: 'Clear Vegetable & Moong Soup with Garlic',
          portion: '1 Large Bowl (200 ml)',
          calories: 90,
          proteinGrams: 4,
          carbsGrams: 14,
          fatsGrams: 1.5,
          notes: 'Heart-healthy allicin from garlic',
        },
        {
          name: '1 Missi Roti / Oats Khichdi with Veggies',
          portion: '1 Serving',
          calories: 140,
          proteinGrams: 5,
          carbsGrams: 26,
          fatsGrams: 2,
          notes: 'Digestible complex fiber',
        },
      ],
    },
    {
      mealType: 'BEDTIME',
      scheduledTime: '22:00',
      tips: 'Taken before night Atorvastatin. Promotes restorative sleep.',
      items: [
        {
          name: 'Warm Haldi Milk (Skimmed / Almond milk) with Nutmeg',
          portion: '100 ml',
          calories: 55,
          proteinGrams: 3,
          carbsGrams: 4,
          fatsGrams: 1,
          notes: 'Supports nighttime cellular recovery',
        },
      ],
    },
  ],
};

let userDietPlans: Record<string, any> = {};

export async function getDietMenu(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id || 'patient-user-001';

  try {
    if (isDatabaseConnected()) {
      let doc = await DietProfileModel.findOne({ userId });
      if (!doc) {
        doc = await DietProfileModel.create({
          userId,
          ...DEFAULT_DIET_PLAN,
        });
      }
      return sendSuccess(res, doc, 'Diet menu retrieved');
    }
  } catch (err) {
    // fallback
  }

  if (!userDietPlans[userId]) {
    userDietPlans[userId] = {
      id: 'diet-plan-001',
      userId,
      ...DEFAULT_DIET_PLAN,
    };
  }

  return sendSuccess(res, userDietPlans[userId], 'Diet menu retrieved');
}

export async function logWaterIntake(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id || 'patient-user-001';
  const { amountDelta, glasses } = req.body;

  try {
    if (isDatabaseConnected()) {
      const doc = await DietProfileModel.findOne({ userId });
      if (doc) {
        if (typeof glasses === 'number') {
          doc.waterLoggedGlasses = Math.max(0, glasses);
        } else if (typeof amountDelta === 'number') {
          doc.waterLoggedGlasses = Math.max(0, doc.waterLoggedGlasses + amountDelta);
        }
        await doc.save();
        return sendSuccess(res, doc, 'Water intake updated');
      }
    }
  } catch (err) {
    // fallback
  }

  if (!userDietPlans[userId]) {
    userDietPlans[userId] = { id: 'diet-plan-001', userId, ...DEFAULT_DIET_PLAN };
  }

  if (typeof glasses === 'number') {
    userDietPlans[userId].waterLoggedGlasses = Math.max(0, glasses);
  } else if (typeof amountDelta === 'number') {
    userDietPlans[userId].waterLoggedGlasses = Math.max(
      0,
      userDietPlans[userId].waterLoggedGlasses + amountDelta
    );
  }

  return sendSuccess(res, userDietPlans[userId], 'Water intake updated');
}

export async function updateDietPlan(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id || 'patient-user-001';
  const updateData = req.body;

  try {
    if (isDatabaseConnected()) {
      const updated = await DietProfileModel.findOneAndUpdate(
        { userId },
        { ...updateData },
        { new: true, upsert: true }
      );
      return sendSuccess(res, updated, 'Diet plan updated');
    }
  } catch (err) {
    // fallback
  }

  if (!userDietPlans[userId]) {
    userDietPlans[userId] = { id: 'diet-plan-001', userId, ...DEFAULT_DIET_PLAN };
  }
  userDietPlans[userId] = { ...userDietPlans[userId], ...updateData };

  return sendSuccess(res, userDietPlans[userId], 'Diet plan updated');
}
