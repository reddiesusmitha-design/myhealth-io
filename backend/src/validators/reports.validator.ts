import { z } from 'zod';

export const reviewFieldSchema = z.object({
  fieldId: z.string().uuid('Invalid field identifier'),
  reviewedValue: z.string().min(1, 'Reviewed value cannot be empty'),
  isApproved: z.boolean(),
});
