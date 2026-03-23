// client/src/util/samplePoints.ts
export type SamplePoint = { lat: number; lon: number };

export function samplePointsInRadius(
  centerLat: number,
  centerLon: number,
  radiusKm: number,
  n: number
): SamplePoint[] {
  const points: SamplePoint[] = [];
  for (let i = 0; i < n; i++) {
    const r = radiusKm * Math.sqrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const dLat = (r / 111) * Math.cos(theta);
    const dLon = (r / (111 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(theta);
    points.push({ lat: centerLat + dLat, lon: centerLon + dLon });
  }
  return points;
}
