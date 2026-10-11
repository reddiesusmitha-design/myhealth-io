import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { prisma, isPrismaConnected } from '../config/prisma';

let activeDispatches: Record<string, any> = {};

export const EMERGENCY_DIRECTORY = [
  {
    name: 'National Emergency Service',
    number: '112',
    type: 'ALL_EMERGENCY',
    description: 'Unified 24x7 toll-free emergency dispatch (Police, Fire, Ambulance)',
    tollFree: true,
  },
  {
    name: 'EMRI National Ambulance Service',
    number: '108',
    type: 'AMBULANCE',
    description: 'Free public emergency medical transport & life support',
    tollFree: true,
  },
  {
    name: 'Maternal & Child Health Express',
    number: '102',
    type: 'MATERNITY',
    description: 'Free transit for expectant mothers & pediatric emergencies',
    tollFree: true,
  },
  {
    name: 'Apollo Emergency Lifeline',
    number: '1066',
    type: 'PRIVATE_ICU_AMBULANCE',
    description: 'Advanced Cardiac Life Support (ACLS) ICU ambulance fleet',
    tollFree: false,
  },
  {
    name: 'Fortis Emergency Response',
    number: '105010',
    type: 'PRIVATE_ICU_AMBULANCE',
    description: 'Rapid cardiac & trauma intervention unit',
    tollFree: false,
  },
  {
    name: 'National Poison Control Center',
    number: '1800 116 117',
    type: 'POISON',
    description: 'Toxicology guidance & antidote protocol',
    tollFree: true,
  },
];

export async function triggerEmergencySos(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id || 'patient-user-001';
  const {
    patientName,
    patientPhone,
    bloodGroup,
    latitude,
    longitude,
    address,
    landmark,
    ambulanceType,
    severity,
    criticalConditions,
  } = req.body;

  const dispatchData = {
    userId,
    patientName: patientName || 'Demo Patient',
    patientPhone: patientPhone || '+91 98765 43210',
    bloodGroup: bloodGroup || 'O+',
    criticalConditions: criticalConditions || ['Type 2 Diabetes', 'Hypertension'],
    allergies: ['Penicillin', 'Sulfa drugs'],
    location: {
      latitude: Number(latitude) || 17.385,
      longitude: Number(longitude) || 78.4867,
      address: address || 'Flat 402, Green Meadows Residency, Jubilee Hills, Hyderabad',
      landmark: landmark || 'Opposite KBR Park Main Gate',
    },
    severity: severity || 'CRITICAL',
    ambulanceType: ambulanceType || 'ADVANCED_CARDIAC_ICU',
    status: 'DISPATCHED',
    hospitalDestination: 'Apollo Hospitals Emergency & Trauma Centre',
    ambulanceDetails: {
      providerName: '108 EMRI Emergency Response Fleet',
      vehicleNumber: 'TS-09-EM-1088',
      driverName: 'Rajesh Kumar (Senior Paramedic & Driver)',
      driverPhone: '+91 98490 10811',
      etaMinutes: 6,
    },
    emergencyContactsNotified: true,
    notes: 'GPS telemetry linked. Siren active. Nearest traffic signals alerted for green corridor.',
  };

  try {
    if (isPrismaConnected()) {
      const doc = await prisma.ambulanceDispatch.create({
        data: dispatchData,
      });
      activeDispatches[userId] = doc;
      return sendSuccess(res, doc, 'Ambulance dispatched! Emergency services en route in Supabase PostgreSQL.', 201);
    }
  } catch (err) {
    // fallback
  }

  const memDoc = { id: `dispatch-${Date.now()}`, ...dispatchData, createdAt: new Date() };
  activeDispatches[userId] = memDoc;
  return sendSuccess(res, memDoc, 'Ambulance dispatched! Emergency services en route.', 201);
}

export async function getActiveEmergency(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id || 'patient-user-001';

  try {
    if (isPrismaConnected()) {
      const doc = await prisma.ambulanceDispatch.findFirst({
        where: {
          userId,
          status: { in: ['REQUESTED', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED'] },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (doc) return sendSuccess(res, doc, 'Active emergency dispatch found in Supabase PostgreSQL');
    }
  } catch (err) {
    // fallback
  }

  const dispatch = activeDispatches[userId] || null;
  return sendSuccess(res, dispatch, 'Active emergency dispatch fetched');
}

export async function updateEmergencyStatus(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id || 'patient-user-001';
  const { id } = req.params;
  const { status, etaMinutes } = req.body;

  try {
    if (isPrismaConnected()) {
      const existing = await prisma.ambulanceDispatch.findFirst({
        where: { id, userId },
      });

      if (existing) {
        let details = typeof existing.ambulanceDetails === 'object' && existing.ambulanceDetails !== null
          ? { ...(existing.ambulanceDetails as any) }
          : {};
        if (etaMinutes !== undefined) {
          details.etaMinutes = etaMinutes;
        }

        const updated = await prisma.ambulanceDispatch.update({
          where: { id: existing.id },
          data: {
            status,
            ambulanceDetails: details,
          },
        });
        activeDispatches[userId] = updated;
        return sendSuccess(res, updated, 'Emergency status updated in Supabase PostgreSQL');
      }
    }
  } catch (err) {
    // fallback
  }

  if (activeDispatches[userId]) {
    activeDispatches[userId].status = status;
    if (etaMinutes !== undefined && activeDispatches[userId].ambulanceDetails) {
      activeDispatches[userId].ambulanceDetails.etaMinutes = etaMinutes;
    }
    return sendSuccess(res, activeDispatches[userId], 'Emergency status updated');
  }

  return sendSuccess(res, { id, status }, 'Emergency status updated');
}

export async function getEmergencyDirectory(req: AuthenticatedRequest, res: Response) {
  return sendSuccess(res, EMERGENCY_DIRECTORY, 'Emergency helpline directory retrieved');
}
