import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { FirstAidGuideModel } from '../models/FirstAid';
import { isDatabaseConnected } from '../config/database';

export const FIRST_AID_GUIDES = [
  {
    slug: 'cpr-adult',
    title: 'Adult CPR (Cardiopulmonary Resuscitation)',
    category: 'CARDIAC',
    severity: 'CRITICAL_CALL_AMBULANCE',
    summary:
      'Immediate hands-only chest compressions to maintain cerebral and myocardial perfusion during sudden cardiac arrest.',
    cprCadenceBpm: 110, // 100-120 BPM (Stayin Alive tempo)
    callEmergencyImmediately: true,
    symptoms: [
      'Unresponsive to voice or physical touch',
      'No normal breathing (or only agonal gasping)',
      'No carotid pulse detected within 10 seconds',
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'Assess Scene & Responsiveness',
        detail:
          'Ensure the surrounding area is safe. Tap both shoulders firmly and shout loudly: "Are you okay?". If no response, yell for immediate help.',
      },
      {
        stepNumber: 2,
        instruction: 'Call 108 / 112 Immediately',
        detail:
          'Designate a specific bystander to call Emergency Services (108) and retrieve an Automated External Defibrillator (AED) if available.',
        warning: 'Do not leave the victim unattended if you are the only rescuer; activate speakerphone.',
      },
      {
        stepNumber: 3,
        instruction: 'Position Hands on Center of Chest',
        detail:
          'Place the heel of one hand in the middle of the chest (lower half of breastbone/sternum). Interlock your other hand on top with elbows locked straight.',
      },
      {
        stepNumber: 4,
        instruction: 'Deliver Firm, Fast Compressions',
        detail:
          'Compress the chest at least 2 to 2.4 inches (5 to 6 cm) deep at a rhythmic cadence of 100 to 120 beats per minute. Allow complete chest recoil between each compression.',
      },
      {
        stepNumber: 5,
        instruction: 'Maintain Cycle Until Relief Arrives',
        detail:
          'Continue non-stop chest compressions until an AED analyzes rhythm, paramedics take over, or the person exhibits purposeful movement.',
      },
    ],
    dos: [
      'Push hard and fast in the exact center of the sternum',
      'Lock your elbows and use your upper body weight to compress',
      'Allow full chest recoil after each downward compression',
      'Switch rescuers every 2 minutes to prevent fatigue-related depth loss',
    ],
    donts: [
      'Do not interrupt compressions for more than 10 seconds',
      'Do not lean on the chest between compressions (prevents venous filling)',
      'Do not hesitate or fear causing injury; CPR is life support',
    ],
  },
  {
    slug: 'choking-heimlich',
    title: 'Choking & Airway Clearing (Heimlich Maneuver)',
    category: 'RESPIRATORY',
    severity: 'CRITICAL_CALL_AMBULANCE',
    summary:
      'Physical intervention to dislodge a foreign object occluding the trachea in a conscious choking individual.',
    callEmergencyImmediately: true,
    symptoms: [
      'Universal choking sign (hands clutched around neck)',
      'Inability to speak, cough effectively, or breathe',
      'High-pitched wheezing sounds (stridor) or silence',
      'Cyanosis (bluish tint around lips, face, or fingernails)',
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'Confirm Complete Airway Obstruction',
        detail:
          'Ask: "Are you choking?". If the person can cough forcefully or speak, encourage them to cough. If they cannot speak or nod yes, intervene immediately.',
      },
      {
        stepNumber: 2,
        instruction: 'Stand Behind & Lean Them Forward',
        detail:
          'Stand behind the victim with your feet shoulder-width apart for balance. Support their chest with one arm and lean them slightly forward.',
      },
      {
        stepNumber: 3,
        instruction: 'Give 5 Sharp Back Blows',
        detail:
          'Using the heel of your dominant hand, deliver up to 5 firm, distinct blows between the shoulder blades.',
      },
      {
        stepNumber: 4,
        instruction: 'Perform 5 Abdominal Thrusts (Heimlich)',
        detail:
          'Make a fist with one hand and place thumb-side against the middle abdomen just above the navel and well below the rib cage. Grasp fist with your other hand and deliver quick, inward and upward thrusts.',
        warning: 'For pregnant women or obese individuals, position hands over center of breastbone (chest thrusts).',
      },
      {
        stepNumber: 5,
        instruction: 'Alternate Cycles Until Clear or Unresponsive',
        detail:
          'Repeat cycle of 5 back blows and 5 abdominal thrusts until the airway clears. If the victim becomes unconscious, lower them gently to the floor and initiate CPR.',
      },
    ],
    dos: [
      'Act rapidly; severe oxygen deprivation causes unconsciousness within minutes',
      'Use quick inward-and-upward upward j-motions for thrusts',
      'Seek post-incident medical evaluation even if foreign body is expelled',
    ],
    donts: [
      'Do not perform blind finger sweeps in the mouth (may push obstruction deeper)',
      'Do not slap the back while the person is standing upright',
      'Do not offer water to someone choking',
    ],
  },
  {
    slug: 'severe-bleeding',
    title: 'Severe Bleeding & Hemorrhage Control',
    category: 'TRAUMA',
    severity: 'CRITICAL_CALL_AMBULANCE',
    summary:
      'Methods to arrest life-threatening external arterial or venous hemorrhages and prevent hypovolemic shock.',
    callEmergencyImmediately: true,
    symptoms: [
      'Pulsing or spurting blood from wound (arterial bleeding)',
      'Continuous pooling or soaking of clothing',
      'Dizziness, pale clammy skin, confusion, or weak pulse',
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'Call 108 and Expose the Wound',
        detail:
          'Call emergency services immediately. Remove or cut away clothing around the injury site to pinpoint exact bleeding origin.',
      },
      {
        stepNumber: 2,
        instruction: 'Apply Direct, Sustained Pressure',
        detail:
          'Cover the wound with sterile gauze or clean cloth. Press firmly with both palms directly onto the wound site. Maintain continuous uninterrupted force for at least 5-10 minutes.',
      },
      {
        stepNumber: 3,
        instruction: 'Secure with Pressure Bandage',
        detail:
          'Wrap an elastic bandage tightly around the dressing. If blood seeps through, add more layers over it; do NOT remove the base layer as it disturbs clot formation.',
      },
      {
        stepNumber: 4,
        instruction: 'Apply Tourniquet for Extremity Bleeding If Needed',
        detail:
          'If heavy arterial bleeding on arm or leg does not stop with pressure, apply a commercial or improvised tourniquet 2 to 3 inches above the wound (between wound and heart, avoiding joints). Tighten until bleeding ceases and record time.',
        warning: 'Never loosen or remove a tourniquet once applied; only qualified emergency surgeons should do so.',
      },
      {
        stepNumber: 5,
        instruction: 'Prevent Shock',
        detail:
          'Lay patient flat on back, keep them warm with a blanket, and calm them while awaiting ambulance.',
      },
    ],
    dos: [
      'Wear gloves or barrier if available to minimize pathogen transfer',
      'Keep continuous firm pressure without lifting dressing to check',
      'Note the exact time if a tourniquet is applied',
    ],
    donts: [
      'Do not remove blood-soaked dressings; always layer additional dressings on top',
      'Do not apply a tourniquet directly over a joint (elbow or knee)',
      'Do not give the patient food or liquids if surgery may be required',
    ],
  },
  {
    slug: 'stroke-fast',
    title: 'Acute Stroke Recognition & FAST Protocol',
    category: 'CARDIAC',
    severity: 'CRITICAL_CALL_AMBULANCE',
    summary:
      'Emergency recognition of cerebral ischemic or hemorrhagic stroke using the validated F.A.S.T. assessment framework.',
    callEmergencyImmediately: true,
    symptoms: [
      'Sudden numbness or weakness of the face, arm, or leg (especially one side)',
      'Sudden confusion, difficulty speaking or understanding speech',
      'Sudden trouble seeing in one or both eyes',
      'Sudden severe thunderclap headache with no known cause',
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'F - Face Drooping',
        detail:
          'Ask the person to smile. Does one side of the face droop or feel numb? Is the smile uneven or lopsided?',
      },
      {
        stepNumber: 2,
        instruction: 'A - Arm Weakness',
        detail:
          'Ask the person to raise both arms straight ahead for 10 seconds. Does one arm drift downward or fail to lift?',
      },
      {
        stepNumber: 3,
        instruction: 'S - Speech Difficulty',
        detail:
          'Ask the person to repeat a simple sentence (e.g., "The sky is blue"). Is speech slurred, strange, or are they unable to produce words?',
      },
      {
        stepNumber: 4,
        instruction: 'T - Time to Call 108 / 112',
        detail:
          'If ANY of these signs are present, call emergency services immediately. Note the exact time symptoms first began — critical for thrombolytic window (within 4.5 hours).',
      },
      {
        stepNumber: 5,
        instruction: 'Patient Positioning & Monitoring',
        detail:
          'Keep patient resting comfortably with head slightly elevated (approx 15-30 degrees). If unconscious, place in lateral recovery position on the paralyzed side.',
      },
    ],
    dos: [
      'Record the exact time when symptoms started ("Last Known Well" time)',
      'Keep the patient calm, resting, and motionless',
      'Inform the ambulance dispatcher immediately of suspected stroke so stroke team can prep',
    ],
    donts: [
      'DO NOT give Aspirin or blood thinners (until CT scan rules out brain hemorrhage)',
      'DO NOT give food, drink, or oral medications (swallowing muscles may be paralyzed)',
      'DO NOT wait to see if symptoms improve; time lost is brain lost',
    ],
  },
  {
    slug: 'burns-scalds',
    title: 'Burns & Scalds Management',
    category: 'TRAUMA',
    severity: 'URGENT',
    summary:
      'Step-by-step thermal burn triage, skin cooling, and sterile dressing protocol for superficial and partial-thickness burns.',
    callEmergencyImmediately: false,
    symptoms: [
      '1st Degree: Redness, pain, mild swelling (epidermis)',
      '2nd Degree: Blistering, severe pain, shiny moist surface',
      '3rd Degree: Charred black, white, leathery, or numb skin (dermis & subcutaneous destruction)',
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'Cool Under Running Water for 20 Minutes',
        detail:
          'Immediately hold the burned area under cool running tap water for a minimum of 20 minutes. This halts progressive thermal tissue damage.',
        warning: 'Use cool or lukewarm tap water only. NEVER use ice, ice water, or frozen packs.',
      },
      {
        stepNumber: 2,
        instruction: 'Remove Constricting Items',
        detail:
          'Gently remove rings, watches, tight bracelets, belts, and loose clothing around the area before tissue begins swelling.',
      },
      {
        stepNumber: 3,
        instruction: 'Protect Blisters Intact',
        detail:
          'Intact blister skin acts as a sterile biological barrier. Do not pop, puncture, or peel blistered skin.',
      },
      {
        stepNumber: 4,
        instruction: 'Cover Loosely with Clean Cling Film or Sterile Dressing',
        detail:
          'Apply clean plastic food cling wrap in flat layers (do not wrap tightly around limbs) or cover with non-adherent sterile dressing.',
      },
      {
        stepNumber: 5,
        instruction: 'Seek Immediate Emergency Care for Severe Burns',
        detail:
          'Call 108 if the burn is larger than the victim’s palm, located on the face, hands, feet, groin, or joints, or caused by chemical/electrical agents.',
      },
    ],
    dos: [
      'Cool under running tap water for a full 20 minutes',
      'Keep the patient warm to prevent hypothermia during prolonged cooling',
      'Seek prompt medical advice for burns on infants and elderly',
    ],
    donts: [
      'Never apply butter, toothpaste, oil, turmeric, or home ointments',
      'Never burst blisters or peel stuck clothing',
      'Never apply direct ice or ice cubes (causes cold tissue necrosis)',
    ],
  },
  {
    slug: 'diabetic-hypoglycemia',
    title: 'Diabetic Hypoglycemia (Rule of 15)',
    category: 'CARDIAC',
    severity: 'URGENT',
    summary:
      'Rapid treatment protocol for severe low blood glucose (<70 mg/dL) in conscious and unconscious diabetic patients.',
    callEmergencyImmediately: false,
    symptoms: [
      'Shakiness, trembling hands, profuse cold sweats',
      'Rapid heartbeat / palpitations',
      'Extreme dizziness, hunger, blurred vision, irritability',
      'Confusion or slurred speech (neuroglycopenia)',
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'Check Blood Glucose Immediately',
        detail:
          'If a glucometer is available, check blood sugar. If below 70 mg/dL (3.9 mmol/L) or if symptoms are evident and no meter is accessible, treat immediately.',
      },
      {
        stepNumber: 2,
        instruction: 'Administer 15 Grams of Fast-Acting Carbohydrate',
        detail:
          'Give ONE of the following: 3 to 4 glucose tablets, half cup (120 ml) of fruit juice or regular (non-diet) soda, 3 teaspoons of sugar dissolved in water, or 1 tablespoon of honey.',
      },
      {
        stepNumber: 3,
        instruction: 'Wait 15 Minutes and Recheck',
        detail:
          'Rest quietly for 15 minutes. Recheck blood glucose level. If still below 70 mg/dL, repeat another 15g fast sugar dose.',
      },
      {
        stepNumber: 4,
        instruction: 'Consume a Sustained Complex Snack',
        detail:
          'Once glucose returns above 70 mg/dL and symptoms ease, eat a snack with complex carbs and protein (e.g. roti with dal, whole grain toast with peanut butter) to sustain levels.',
      },
      {
        stepNumber: 5,
        instruction: 'If Unconscious: Never Put Liquids in Mouth',
        detail:
          'If the patient becomes drowsy or unconscious, call 108 immediately. Place in recovery position. Do NOT pour liquids or force sugar into their mouth (aspiration hazard). Paramedics will administer IV Dextrose or Glucagon.',
        warning: 'Choking hazard: Only give oral food or juice if patient is awake and able to swallow safely.',
      },
    ],
    dos: [
      'Use pure fast-acting simple sugar without fat (fat delays sugar absorption)',
      'Follow the strict "Rule of 15" (15g sugar, wait 15 min, recheck)',
      'Always carry glucose sweets or tablets in your pocket or bag',
    ],
    donts: [
      'Do not treat low blood sugar with chocolate or ice cream (fat slows digestion)',
      'Do not give anything orally to an unconscious or seizing individual',
      'Do not delay treatment to seek advice; treat first',
    ],
  },
  {
    slug: 'seizures-convulsions',
    title: 'Seizures & Convulsions First Aid',
    category: 'RESPIRATORY',
    severity: 'URGENT',
    summary:
      'Safety protocol and recovery positioning during epileptic or febrile convulsions to prevent physical injury.',
    callEmergencyImmediately: false,
    symptoms: [
      'Sudden body stiffening followed by rhythmic jerking movements',
      'Loss of consciousness or falling to the floor',
      'Drooling, frothing at mouth, irregular breathing',
      'Temporary confusion or lethargy after event (postictal state)',
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'Clear Immediate Surroundings',
        detail:
          'Move away sharp objects, hard furniture, or dangerous hazards to protect the individual from physical trauma.',
      },
      {
        stepNumber: 2,
        instruction: 'Cushion Head & Loosen Neckwear',
        detail:
          'Place a soft folded jacket, towel, or pillow gently under their head. Loosen tight collars, ties, or jewelry around the neck.',
      },
      {
        stepNumber: 3,
        instruction: 'Time the Duration of Seizure',
        detail:
          'Look at your watch and time the seizure. Call 108 if the convulsion lasts longer than 5 minutes, if another seizure follows without regained consciousness, or if the person is pregnant or injured.',
      },
      {
        stepNumber: 4,
        instruction: 'Roll Gently into Recovery Position Once Jerking Stops',
        detail:
          'As active convulsions subside, roll the person onto their side. Tilt head slightly back and chin up to keep the airway open and let fluids drain.',
      },
      {
        stepNumber: 5,
        instruction: 'Stay with Them Until Fully Lucid',
        detail:
          'Reassure them calmly. They may be confused or disoriented for 15-30 minutes after recovering.',
      },
    ],
    dos: [
      'Protect their head with a soft cushion',
      'Turn onto their side into recovery position as soon as convulsions end',
      'Stay calm and reassure the person as they regain consciousness',
    ],
    donts: [
      'NEVER put your fingers, spoons, keys, or any object into their mouth (myth and dental danger)',
      'NEVER restrain or forcefully hold down their limbs during jerking',
      'NEVER give liquids or pills until fully conscious and alert',
    ],
  },
  {
    slug: 'snake-bites',
    title: 'Venomous Snake Bite Protocol',
    category: 'POISONING',
    severity: 'CRITICAL_CALL_AMBULANCE',
    summary:
      'Immobilization and emergency evacuation guidelines for suspected elapid or viperid venomous snake bites.',
    callEmergencyImmediately: true,
    symptoms: [
      'Puncture fang marks with local pain, swelling, or blistering',
      'Ptosis (drooping eyelids), blurred vision, difficulty swallowing',
      'Bleeding from gums or non-clotting wound',
      'Nausea, sweating, weakness, abdominal pain',
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'Step Away and Remain Calm',
        detail:
          'Move out of striking range. Reassure the victim. Keeping heart rate low slows the lymphatic dissemination of venom.',
      },
      {
        stepNumber: 2,
        instruction: 'Call 108 Immediately for Emergency Evacuation',
        detail:
          'Alert ambulance services. State suspected snake bite so they can arrange transport directly to an Anti-Snake Venom (ASV) equipped hospital.',
      },
      {
        stepNumber: 3,
        instruction: 'Immobilize the Bitten Limb with a Splint',
        detail:
          'Keep the affected arm or leg completely still and at or slightly below heart level. Splint the limb with a stick or cardboard to prevent muscle contraction.',
      },
      {
        stepNumber: 4,
        instruction: 'Remove Rings, Watches, and Tight Clothes',
        detail:
          'Remove jewelry and footwear from the limb immediately before severe swelling develops.',
      },
      {
        stepNumber: 5,
        instruction: 'Transport Patient on Stretcher',
        detail:
          'Ensure the patient does not walk or exert muscles. Carry them to ambulance.',
      },
    ],
    dos: [
      'Keep the patient totally calm and resting still',
      'Immobilize the limb like a broken bone',
      'Note the physical description or snap a safe phone photo of the snake if possible (from distance)',
    ],
    donts: [
      'NEVER cut, incise, or suck the venom (dangerous movie myth)',
      'NEVER apply tight arterial tourniquets (causes ischemia and tissue amputation)',
      'NEVER apply ice, herbal pastes, or electric shocks',
    ],
  },
];

export async function listFirstAidGuides(req: Request, res: Response) {
  try {
    if (isDatabaseConnected()) {
      const count = await FirstAidGuideModel.countDocuments();
      if (count === 0) {
        await FirstAidGuideModel.insertMany(FIRST_AID_GUIDES);
      }
      const docs = await FirstAidGuideModel.find().select('-__v');
      return sendSuccess(res, docs, 'First aid guides retrieved');
    }
  } catch (err) {
    // fallback
  }

  return sendSuccess(res, FIRST_AID_GUIDES, 'First aid guides retrieved');
}

export async function getFirstAidGuideBySlug(req: Request, res: Response) {
  const { slug } = req.params;

  try {
    if (isDatabaseConnected()) {
      const doc = await FirstAidGuideModel.findOne({ slug });
      if (doc) return sendSuccess(res, doc, 'First aid guide details retrieved');
    }
  } catch (err) {
    // fallback
  }

  const guide = FIRST_AID_GUIDES.find((g) => g.slug === slug);
  if (!guide) {
    return sendError(res, 'First aid guide not found', 404);
  }

  return sendSuccess(res, guide, 'First aid guide details retrieved');
}
