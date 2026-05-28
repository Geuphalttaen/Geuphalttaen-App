import { z } from 'zod';
import { apiClient } from '@/src/shared/lib/client';

const LatLngSchema = z.object({ lat: z.number(), lng: z.number() });

export const DirectionsResultSchema = z.object({
  path: z.array(LatLngSchema),
  distanceMeters: z.number(),
  durationMs: z.number(),
});

export type DirectionsResult = z.infer<typeof DirectionsResultSchema>;

export async function fetchDirections(params: {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
}): Promise<DirectionsResult> {
  const { data } = await apiClient.get('/api/v1/directions', { params });
  return DirectionsResultSchema.parse(data);
}
