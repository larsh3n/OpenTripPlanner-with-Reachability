// client/src/hooks/useReachability.ts
import { useState, useCallback } from 'react';
import { samplePointsInRadius, SamplePoint } from '../util/samplePoints';
import { runTripQuery } from '../util/runTripQuery';

type Feature = GeoJSON.Feature<GeoJSON.Point, { color: string }>;

function isValidNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

export function useReachability() {
  const [points, setPoints] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);

  const compute = useCallback(
    async (targetLat: number, targetLon: number, radiusKm = 10, n = 400) => {
      // 🔒 harte Eingangsprüfung
      if (!isValidNumber(targetLat) || !isValidNumber(targetLon)) {
        console.error('Invalid target coords:', targetLat, targetLon);
        return;
      }

      setLoading(true);
      setPoints([]); // wichtig: alte Marker weg

      const samples: SamplePoint[] = samplePointsInRadius(
        targetLat,
        targetLon,
        radiusKm,
        n
      );

      const promises = samples.map(async (s, i) => {
        // 🔒 Sample-Validierung
        if (!isValidNumber(s.lat) || !isValidNumber(s.lon)) {
          console.warn('Invalid sample coords', i, s);
          return null;
        }

        const duration = await runTripQuery(s, {
          lat: targetLat,
          lon: targetLon,
        });

        if (duration == null || !Number.isFinite(duration)) {
          return null;
        }

        let color = 'red';
        if (duration < 25 * 60) color = 'green';
        else if (duration < 45 * 60) color = 'yellow';

        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [s.lon, s.lat], // garantiert valide
          },
          properties: { color },
        } as Feature;
      });

      const results = await Promise.all(promises);

      // 🔒 Finale Filterung (extra Sicherheit)
      const features = results.filter(
        (f): f is Feature =>
          !!f &&
          Array.isArray(f.geometry.coordinates) &&
          f.geometry.coordinates.length === 2 &&
          isValidNumber(f.geometry.coordinates[0]) &&
          isValidNumber(f.geometry.coordinates[1])
      );

      console.log(
        `Reachability: ${features.length} / ${samples.length} valid points`
      );

      setPoints(features);
      setLoading(false);
    },
    []
  );

  return { points, loading, compute };
}
